const express = require("express")

const router = express.Router();

router.use('/userapp/auth',require('./userapp/auth'))
router.use('/userapp/post',require('./userapp/post'))
router.use('/userapp/search',require('./userapp/search'))
router.use('/userapp/user',require('./userapp/user'))
router.use('/userapp/friendship',require('./userapp/friendship'))
router.use('/userapp/chat',require('./userapp/chat'))
router.use('/userapp/message',require('./userapp/message'))

module.exports = router;