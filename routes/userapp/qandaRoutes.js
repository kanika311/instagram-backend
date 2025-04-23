const express = require("express");
const router = express.Router();
const qandaController = require("../../controller/user/qandaController");
const {PLATFORM} = require("../../constants/authConstant");
const auth = require("../../middleware/auth");




router.get('/get/:id',auth(PLATFORM.USERAPP), qandaController.getQanda);
router.post('/list',auth(PLATFORM.USERAPP), qandaController.findAllQandas);



module.exports = router;