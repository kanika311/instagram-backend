const express = require('express')
const path = require('path')
const routes = require('./routes')
const cors = require('cors')
const cookieParser = require("cookie-parser")
const passport = require('passport');
const { userappPassportStrategy } = require('./config/userappPassportStrategy');
const {Server} = require("socket.io")
const {createServer} = require("http")
const Chat = require('./model/chat')
const Message = require('./model/message')
const User = require('./model/user')

const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const dbConnection = require('./config/db');
dbConnection();


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT"]
    }
});

const port = process.env.PORT || 9000;

app.use(require('./utils/response/responseHandler'));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(passport.initialize());
app.use("/uploads",express.static(path.join(__dirname, "uploads")));


app.use(routes);

let onlineUsers = [];

io.on('connection', (socket) => {
    try {
      console.log('a user connected', socket.id);
    
      socket.on('disconnect', () => {
        console.log('user disconnected');
        // disconnect user
        onlineUsers = onlineUsers.filter((user)=> user.socketId !== socket.id)
      });
    
      socket.on('new user', async ({username}) => {
        // Save username and socket id to database
        onlineUsers.push({ username, socketId: socket.id });
        const userId = await User.findOne({username: username}).select('_id');
        const chatId = await Chat.find({ users: { $in: [userId] } }).select('_id isGroup');
        for (const chat of chatId) {
          if(chat.isGroup) {
            socket.join("room-"+JSON.stringify(chat._id));
          }
        }
        
      });
    
      socket.on('chat message', async({senderId, message, receiverId, chatId }) => {
        
        let sender = onlineUsers.find(user => user.socketId === socket.id);
        if(receiverId && !chatId) {
          const userIdName = await User.findById(receiverId).select('username');
          let receiver = onlineUsers.find(user => user.username === userIdName.username);
          if(receiver && receiver.socketId){
            io.to(receiver.socketId).emit('chat message', { message, sender: sender.username, time: new Date()});
          }
          const chat = await Chat.findOne({
            $or: [
              { users: [senderId, receiverId] },
              { users: [receiverId, senderId] }
            ]
          });
          if(chat) {
            const newMessage = new Message({ userId: senderId,chatId:chat._id, message });
            const result = await Message.create(newMessage);
            console.log("message created", result);
            let messages = [...chat.messages, result._id];
            console.log("messages", messages, chat._id);
            const updatedChat = await Chat.findByIdAndUpdate({_id: chat._id},{messages: messages});
            console.log("update chat", updatedChat);
          }
          else{
            const newChat = new Chat({users:[senderId, receiverId],createBy: senderId})
            const result = await Chat.create(newChat);
            console.log("chat created", result);
            const newMessage = new Message({ userId: senderId,chatId:result._id, message });
            const resultMessage = await Message.create(newMessage);
            console.log("message when no chat id created", resultMessage);
            const updatedChat = await Chat.findByIdAndUpdate({_id: result._id},{messages: [resultMessage._id]});
        }
      
      }
        if(!receiverId && chatId) {
          let sender = onlineUsers.find(user => user.socketId === socket.id);
          io.to("room-"+JSON.stringify(chatId)).emit('chat message', { message, sender: sender.username , time: new Date()});
          const newMessage = new Message({ userId: senderId,chatId:chatId, message });
          const result = await Message.create(newMessage);
          const chat = await Chat.findById(chatId);
          let messages = [...chat.messages, result._id];
          const updatedChat = await Chat.findByIdAndUpdate({_id: chatId}, {messages: messages});
        }
      });

      // Typing event
    socket.on('typing', ({ chatId, username }) => {
      if (chatId) {
        io.to("room-" + JSON.stringify(chatId)).emit('typing', { username });
      } else {
        socket.broadcast.emit('typing', { username });
      }
    });
  
      socket.on('online users', async () => {
        io.emit('online users', onlineUsers);
      });
    } catch (error) {
      console.log(error);
    }

      
  });

userappPassportStrategy(passport);

server.listen(port,()=>{
    console.log(`Application is running on port no: ${port}`);
})
