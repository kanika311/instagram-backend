const express = require("express");
const router = express.Router();
const authController = require('../../controller/user/authController');


router.post('/register',authController.register);
router.post('/login',authController.login);
router.post('/firebase/google',authController.googleLogin);
router.route('/reset-password').put(authController.resetPassword);
router.route('/reset-password-otp').post(authController.sentResetPasswordOtp);
router.route('/validate-otp').post(authController.validateOtp);

module.exports = router;