const Chat = require('../model/chat');
const Message = require('../model/message');
const User = require('../model/user');

const chatController = {
  // Create a new chat (1:1 or group)
  createChat: async (req, res) => {
    try {
      const { users, isGroup, groupName, picture, description } = req.body;
      const createdBy = req.user.id;

      // Validate input
      if (!users || !Array.isArray(users) || users.length < 1) {
        return res.badRequest({ message: 'At least one participant is required' });
      }

      if (isGroup && !groupName) {
        return res.badRequest({ message: 'Group name is required for group chats' });
      }

      // Check if 1:1 chat already exists
      if (!isGroup && users.length === 1) {
        const existingChat = await Chat.findOne({
          isGroup: false,
          users: { $all: [createdBy, users[0]], $size: 2 }
        });

        if (existingChat) {
          return res.success({
            message: 'Chat already exists',
            data: existingChat
          });
        }
      }

      // Create new chat
      const newChat = new Chat({
        users: [...users, createdBy],
        isGroup,
        groupName,
        picture,
        description,
        createdBy,
        admin: isGroup ? [createdBy] : []
      });

      await newChat.save();

      return res.success({
        message: 'Chat created successfully',
        data: newChat
      });

    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Get user's chats
  getUserChats: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { updatedAt: -1 },
        populate: [
          { path: 'users', select: 'username name picture' },
          { path: 'lastMessage', select: 'message createdAt' },
          { path: 'admin', select: 'username name picture' }
        ]
      };

      const chats = await Chat.paginate(
        { users: userId, isDeleted: false },
        options
      );

      return res.success({ data: chats });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Get chat details
  getChatDetails: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const chat = await Chat.findOne({
        _id: chatId,
        users: userId,
        isDeleted: false
      })
      .populate('users', 'username name picture')
      .populate('admin', 'username name picture')
      .populate('lastMessage');

      if (!chat) {
        return res.recordNotFound({ message: 'Chat not found or access denied' });
      }

      return res.success({ data: chat });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Update group info
  updateGroup: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { groupName, picture, description } = req.body;
      const userId = req.user.id;

      // Check if user is admin
      const chat = await Chat.findOne({
        _id: chatId,
        isGroup: true,
        admin: userId
      });

      if (!chat) {
        return res.unauthorized({ message: 'Only group admins can update group info' });
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { groupName, picture, description },
        { new: true }
      );

      return res.success({
        message: 'Group updated successfully',
        data: updatedChat
      });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Add participants to group
  addParticipants: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { userIds } = req.body;
      const currentUserId = req.user.id;

      const chat = await Chat.findOne({
        _id: chatId,
        isGroup: true,
        admin: currentUserId
      });

      if (!chat) {
        return res.unauthorized({ message: 'Only group admins can add participants' });
      }

      // Filter out existing users
      const newUsers = userIds.filter(id => 
        !chat.users.includes(id) && 
        id.toString() !== currentUserId.toString()
      );

      if (newUsers.length === 0) {
        return res.badRequest({ message: 'No new users to add' });
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $addToSet: { users: { $each: newUsers } } },
        { new: true }
      );

      return res.success({
        message: 'Participants added successfully',
        data: updatedChat
      });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  },

  // Remove participant from group
  removeParticipant: async (req, res) => {
    try {
      const { chatId, userId } = req.params;
      const currentUserId = req.user.id;

      const chat = await Chat.findOne({
        _id: chatId,
        isGroup: true,
        admin: currentUserId
      });

      if (!chat) {
        return res.unauthorized({ message: 'Only group admins can remove participants' });
      }

      // Prevent removing yourself
      if (userId === currentUserId.toString()) {
        return res.badRequest({ message: 'You cannot remove yourself' });
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId, admin: userId } },
        { new: true }
      );

      return res.success({
        message: 'Participant removed successfully',
        data: updatedChat
      });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  }
};

module.exports = chatController;