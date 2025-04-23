const express = require("express");
const router = express.Router();
const qandaResponseController = require("../../controller/admin/qandaResponseController");
const {PLATFORM} = require("../../constants/authConstant");
const auth = require("../../middleware/auth");



router.post('/add',auth(PLATFORM.ADMIN), qandaResponseController.addQandaResponse);
router.get('/get/:id',auth(PLATFORM.ADMIN), qandaResponseController.getQandaResponse);
router.post('/list',auth(PLATFORM.ADMIN), qandaResponseController.findAllQandaResponses);
router.put('/update/:id',auth(PLATFORM.ADMIN), qandaResponseController.updateQandaResponse);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), qandaResponseController.softDeleteQandaResponse);
router.delete('/delete/:id',auth(PLATFORM.ADMIN), qandaResponseController.deleteQandaResponse);


module.exports = router;