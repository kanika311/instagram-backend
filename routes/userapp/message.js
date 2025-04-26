const express = require("express");
const router = express.Router();
const messageController = require('../../controller/user/messageController');
const auth = require("../../middleware/auth");
const { PLATFORM } = require("../../constants/authConstant");

router.post('/send',auth(PLATFORM.USERAPP), messageController.sendMessage);
router.post('/list',auth(PLATFORM.USERAPP), messageController.findAllMessage);
router.post('/chatlist',auth(PLATFORM.USERAPP), messageController.getChatList);
router.get('/get/:chatId',auth(PLATFORM.USERAPP), messageController.getMessages);
router.post('/mark-seen',auth(PLATFORM.USERAPP), messageController.markAsSeen);
router.delete('/delete/:messageId',auth(PLATFORM.USERAPP), messageController.deleteMessage);


module.exports = router;