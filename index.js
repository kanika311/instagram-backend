const express = require('express');
const path = require('path');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { userappPassportStrategy } = require('./config/userappPassportStrategy');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const setupSocket = require('./config/socket');

dotenv.config({ path: '.env' });

const dbConnection = require('./config/db');
dbConnection();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Initialize Socket.IO
setupSocket(io);

// Attach io to app for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

const port = process.env.PORT || 9000;

app.use(require('./utils/response/responseHandler'));
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(routes);

userappPassportStrategy(passport);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});