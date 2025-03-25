const express = require("express");
const router = express.Router();
const friendshipController = require("../controller/friendshipController");
const {PLATFORM} = require("../constants/authConstant");
const auth = require("../middleware/auth");


// router.post('/list',auth(PLATFORM.USERAPP), userController.findAllUser);
router.put('/create',auth(PLATFORM.USERAPP), friendshipController.create);
router.put('/reqAccept',auth(PLATFORM.USERAPP), friendshipController.reqAccept);
router.post('/findAllRequest',auth(PLATFORM.USERAPP), friendshipController.findAllRequest);
router.put('/destroy',auth(PLATFORM.USERAPP), friendshipController.destroy);
router.put('/removeFollower',auth(PLATFORM.USERAPP), friendshipController.reqRemoveFollower);

module.exports = router;