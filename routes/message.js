const express = require("express");
const router = express.Router();
const MessageController = require('../controller/messageController');
const auth = require("../middleware/auth");
const { PLATFORM } = require("../constants/authConstant");

router.post('/findAllMessage/:chatId',auth(PLATFORM.USERAPP),MessageController.findAllMessage);
router.put('/updateMessage/:id',auth(PLATFORM.USERAPP),MessageController.updateMessage);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP),MessageController.softDeleteMessage);
router.delete('/deleteMessage/:id',auth(PLATFORM.USERAPP),MessageController.deleteMessage);


module.exports = router;