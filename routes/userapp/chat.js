const express = require("express");
const router = express.Router();
const chatController = require('../../controller/user/chatController');
const auth = require("../../middleware/auth");
const { PLATFORM } = require("../../constants/authConstant");


router.post('/',auth(PLATFORM.USERAPP), chatController.createChat);
router.get('/',auth(PLATFORM.USERAPP), chatController.getUserChats);
router.get('/:chatId',auth(PLATFORM.USERAPP), chatController.getChatDetails);
router.put('/group/:chatId',auth(PLATFORM.USERAPP), chatController.updateGroup);
router.post('/group/:chatId/participants',auth(PLATFORM.USERAPP), chatController.addParticipants);
router.delete('/group/:chatId/participants/:userId',auth(PLATFORM.USERAPP), chatController.removeParticipant);



module.exports = router;