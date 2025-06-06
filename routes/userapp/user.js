const express = require("express");
const router = express.Router();
const userController = require("../../controller/user/userController");
const {PLATFORM} = require("../../constants/authConstant");
const auth = require("../../middleware/auth");


// router.post('/list',auth(PLATFORM.USERAPP), userController.findAllUser);
router.get('/me',auth(PLATFORM.USERAPP), userController.me);
router.get('/getProfileInfo',auth(PLATFORM.USERAPP), userController.getProfileInfo);
router.get('/get/:id',auth(PLATFORM.USERAPP), userController.getUser);
router.post('/list',auth(PLATFORM.USERAPP), userController.findAllUser);
router.put('/update/:id',auth(PLATFORM.USERAPP), userController.updateUser);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), userController.softDeleteUser);
router.delete('/delete/:id',auth(PLATFORM.USERAPP), userController.deleteUser);
router.put('/upload/:userId',auth(PLATFORM.USERAPP),userController.uploadMiddleware,userController.uploadProfilePicture)

module.exports = router;