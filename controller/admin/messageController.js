const Message = require('../../model/message');
const Chat = require('../../model/chat');
const onlineUsers = new Map();

const messageController = {
  // Send a message
  sendMessage: async (req, res) => {
    try {
      const { receiverId, message, isGroup, groupId } = req.body;
      const senderId = req.user.id;
  
      // Validate required fields
      if (!message || (!isGroup && !receiverId)) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      let chatId;
      let chat;
  
      // **1:1 Chat Flow**
      if (!isGroup) {
        // Find existing chat between sender and receiver
        chat = await Chat.findOne({
          isGroup: false,
          users: { $all: [senderId, receiverId], $size: 2 },
        });
  
        // If chat doesn't exist, create a new one
        if (!chat) {
          chat = await Chat.create({
            users: [senderId, receiverId],
            isGroup: false,
            createdBy: senderId,
          });
  
          // Notify both users about new chat
          const senderSocket = onlineUsers.get(senderId);
          const receiverSocket = onlineUsers.get(receiverId);
          if (senderSocket) req.io.to(senderSocket.socketId).emit("new_chat", chat);
          if (receiverSocket) req.io.to(receiverSocket.socketId).emit("new_chat", chat);
        }
  
        chatId = chat._id;
      } 
      // **Group Chat Flow**
      else {
        chat = await Chat.findOne({ _id: groupId, users: senderId });
        if (!chat) return res.status(403).json({ message: "Unauthorized to send messages in this group" });
  
        chatId = groupId;
      }
  
      // **Create & Save Message**
      const newMessage = await Message.create({
        userId: senderId,
        chatId,
        message,
        seenBy: [senderId], // Sender has seen their own message
      });
  
      // **Update Chat's Last Message**
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        updatedAt: new Date(),
      });
  
      // **Emit Socket Event for New Message**
      req.io.to(`room-${chatId}`).emit("new_message", {
        message: newMessage,
        chatId,
      });
  
      return res.status(200).json({
        message: "Message sent successfully",
        data: newMessage,
      });
  
    } catch (error) {
      console.error("SendMessage Error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  

  // Get chat messages
  getMessages: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      // Check if user is part of the chat
      const isParticipant = await Chat.exists({
        _id: chatId,
        users: userId,
        isDeleted: false
      });

      if (!isParticipant) {
        return res.unauthorized({ message: 'You are not part of this chat' });
      }

      // Get messages with pagination
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
          { path: 'userId', select: 'username name picture' },
          { path: 'seenBy', select: 'username name picture' }
        ]
      };

      const messages = await Message.paginate(
        { chatId, isDeleted: false },
        options
      );

      return res.success({ data: messages });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Mark messages as seen
  markAsSeen: async (req, res) => {
    try {
      const { messageIds } = req.body;
      const userId = req.user.id;

      if (!messageIds || !Array.isArray(messageIds)) {
        return res.badRequest({ message: 'Invalid message IDs' });
      }

      // Update seenBy for messages
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { seenBy: userId } }
      );

      // Get chat IDs for socket emission
      const messages = await Message.find({ _id: { $in: messageIds } })
        .select('chatId');
      
      const chatIds = [...new Set(messages.map(m => m.chatId.toString()))];

      // Emit seen event
      chatIds.forEach(chatId => {
        req.io.to(`room-${chatId}`).emit('messages_seen', {
          messageIds,
          seenBy: userId,
          chatId
        });
      });

      return res.success({ message: 'Messages marked as seen' });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Delete message
  deleteMessage: async (req, res) => {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await Message.findOneAndUpdate(
        { _id: messageId, userId },
        { isDeleted: true },
        { new: true }
      );

      if (!message) {
        return res.notFound({ message: 'Message not found or not authorized' });
      }

      // Emit delete event
      req.io.to(`room-${message.chatId}`).emit('message_deleted', {
        messageId,
        chatId: message.chatId
      });

      return res.success({ message: 'Message deleted successfully' });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  }
};

module.exports = messageController;