const express = require("express")

const router = express.Router();

router.use('/admin/auth',require('./auth'))
router.use('/admin/post',require('./post'))
router.use('/admin/search',require('./search'))
router.use('/admin/user',require('./user'))
router.use('/admin/friendship',require('./friendship'))
router.use('/admin/chat',require('./chat'))
router.use('/admin/message',require('./message'))
router.use('/admin/qanda',require('./qandaRoutes'))
router.use('/admin/qanda-response',require('./qandaresponseRoutes'))

module.exports = router;