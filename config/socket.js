const Chat = require("../model/chat");
const Message = require("../model/message");
const User = require("../model/user");

module.exports = (io) => {
  let onlineUsers = new Map(); // Use Map for faster lookup

  io.on("connection", (socket) => {
    try {
      console.log("A user connected:", socket.id);

      // Handle User Disconnection
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const [userId, userData] of onlineUsers.entries()) {
          if (userData.socketId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }
        io.emit("online users", Array.from(onlineUsers.values()));
      });

      // **User Authentication & Joining Chat Rooms**
      socket.on("new user", async ({ userId }) => {
        try {
          const user = await User.findById(userId).select("_id");
          if (!user) return;

          // Store user in online list
          onlineUsers.set(user._id.toString(), {
            socketId: socket.id,
            userId: user._id.toString(),
          });

          // Join user's chat rooms
          const chats = await Chat.find({ users: user._id }).select("_id isGroup");
          chats.forEach((chat) => {
            socket.join(`room-${chat._id}`);
          });

          io.emit("online users", Array.from(onlineUsers.values()));
        } catch (err) {
          console.error("New User Error:", err);
        }
      });

      // **Handle Sending Messages**
      socket.on("chat message", async ({ senderId, message, receiverId, chatId }) => {
        try {
          let sender = onlineUsers.get(senderId);
          console.log("sender", sender)
          if (!sender) return;

          // **1-on-1 Chat Flow**
          if (receiverId && !chatId) {
            const receiver = await User.findById(receiverId).select("_id");
            const receiverSocket = onlineUsers.get(receiverId);

            // Find or Create Chat
            let chat = await Chat.findOne({
              $or: [
                { users: [senderId, receiverId] },
                { users: [receiverId, senderId] },
              ],
            });

            if (!chat) {
              chat = await Chat.create({
                users: [senderId, receiverId],
                createdBy: senderId,
              });
            }

            // Save Message
            const newMessage = await Message.create({
              userId: senderId,
              chatId: chat._id,
              message,
            });

            // Emit Message to Receiver if Online
            if (receiverSocket) {
              io.to(receiverSocket.socketId).emit("chat message", {
                message,
                sender: sender.userId,
                time: new Date(),
              });
            }

            // Update Chat Messages
            await Chat.findByIdAndUpdate(chat._id, {
              $push: { messages: newMessage._id },
            });
          }

          // **Group Chat Flow**
          if (!receiverId && chatId) {
            const chat = await Chat.findById(chatId);
            if (!chat) return;

            // Save Message
            const newMessage = await Message.create({
              userId: senderId,
              chatId: chatId,
              message,
            });

            // Emit Message to Group Chat Room
            io.to(`room-${chatId}`).emit("chat message", {
              message,
              sender: sender.userId,
              time: new Date(),
            });

            // Update Chat Messages
            await Chat.findByIdAndUpdate(chatId, {
              $push: { messages: newMessage._id },
            });
          }
        } catch (err) {
          console.error("Chat Message Error:", err);
        }
      });

      // **Typing Event**
      socket.on("typing", ({ chatId, username }) => {
        if (chatId) {
          io.to(`room-${chatId}`).emit("typing", { username });
        } else {
          socket.broadcast.emit("typing", { username });
        }
      });

      // **Send Online Users List**
      socket.on("online users", () => {
        io.emit("online users", Array.from(onlineUsers.values()));
      });
    } catch (error) {
      console.error("Socket Connection Error:", error);
    }
  });
};
