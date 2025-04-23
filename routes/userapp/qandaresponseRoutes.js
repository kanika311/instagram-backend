const express = require("express");
const router = express.Router();
const qandaResponseController = require("../../controller/user/qandaResponseController");
const {PLATFORM} = require("../../constants/authConstant");
const auth = require("../../middleware/auth");



router.post('/add',auth(PLATFORM.USERAPP), qandaResponseController.addQandaResponse);
router.get('/get/:id',auth(PLATFORM.USERAPP), qandaResponseController.getQandaResponse);
router.post('/list',auth(PLATFORM.USERAPP), qandaResponseController.findAllQandaResponses);
router.put('/update/:id',auth(PLATFORM.USERAPP), qandaResponseController.updateQandaResponse);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), qandaResponseController.softDeleteQandaResponse);
router.delete('/delete/:id',auth(PLATFORM.USERAPP), qandaResponseController.deleteQandaResponse);


module.exports = router;