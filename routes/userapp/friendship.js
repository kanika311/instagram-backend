const express = require("express");
const router = express.Router();
const friendshipController = require("../../controller/user/friendshipController");
const {PLATFORM} = require("../../constants/authConstant");
const auth = require("../../middleware/auth");


// router.post('/list',auth(PLATFORM.USERAPP), userController.findAllUser);
router.post('/follow',auth(PLATFORM.USERAPP), friendshipController.create);
router.post('/accept-request',auth(PLATFORM.USERAPP), friendshipController.reqAccept);
router.post('/reject-request',auth(PLATFORM.USERAPP), friendshipController.rejectRequest);
router.post('/cancel-request',auth(PLATFORM.USERAPP), friendshipController.cancelRequest);
router.post('/unfollow',auth(PLATFORM.USERAPP), friendshipController.unfollow);
router.get('/followers',auth(PLATFORM.USERAPP), friendshipController.getFollowers);
router.get('/following',auth(PLATFORM.USERAPP), friendshipController.getFollowing);
router.get('/request',auth(PLATFORM.USERAPP), friendshipController.getFollowRequests);
router.post('/remove',auth(PLATFORM.USERAPP), friendshipController.removeFollower);

module.exports = router;