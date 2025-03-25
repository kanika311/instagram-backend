const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const {PLATFORM} = require("../constants/authConstant");
const auth = require("../middleware/auth");


// router.post('/list',auth(PLATFORM.USERAPP), userController.findAllUser);
router.get('/me',auth(PLATFORM.USERAPP), userController.me);
router.get('/getProfileInfo',auth(PLATFORM.USERAPP), userController.getProfileInfo);
router.put('/update/:id',auth(PLATFORM.USERAPP), userController.updateUser);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), userController.softDeleteUser);
router.delete('/delete/:id',auth(PLATFORM.USERAPP), userController.deleteUser);

module.exports = router;