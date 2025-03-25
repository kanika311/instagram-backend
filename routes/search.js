const express = require("express");
const router = express.Router();
const searchController = require("../controller/searchController");
const {PLATFORM} = require("../constants/authConstant");
const auth = require("../middleware/auth");


router.post('/getUser',auth(PLATFORM.USERAPP),searchController.getUser);
router.post('/checkUsername',searchController.checkUsername);

module.exports = router;