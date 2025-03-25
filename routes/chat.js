const express = require("express");
const router = express.Router();
const chatController = require('../controller/chatController');
const auth = require("../middleware/auth");
const { PLATFORM } = require("../constants/authConstant");


router.post('/create',auth(PLATFORM.USERAPP),chatController.create);
router.get('/getChat/:id',auth(PLATFORM.USERAPP),chatController.getChat);
router.get('/findAllChat',auth(PLATFORM.USERAPP),chatController.findAllChat);
router.put('/updateChat/:id',auth(PLATFORM.USERAPP),chatController.updateChat);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP),chatController.softDeleteChat);
router.delete('/deleteChat/:id',auth(PLATFORM.USERAPP),chatController.deleteChat);


module.exports = router;