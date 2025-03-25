const express = require("express")

const router = express.Router();

router.use('/userapp/auth',require('./auth'))
router.use('/userapp/post',require('./post'))
router.use('/userapp/search',require('./search'))
router.use('/userapp/user',require('./user'))
router.use('/userapp/friendship',require('./friendship'))
router.use('/userapp/chat',require('./chat'))

module.exports = router;