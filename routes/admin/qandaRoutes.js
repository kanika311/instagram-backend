const express = require("express");
const router = express.Router();
const qandaController = require("../../controller/admin/qandaController");
const {PLATFORM} = require("../../constants/authConstant");
const auth = require("../../middleware/auth");



router.post('/add',auth(PLATFORM.ADMIN), qandaController.addQanda);
router.get('/get/:id',auth(PLATFORM.ADMIN), qandaController.getQanda);
router.post('/list',auth(PLATFORM.ADMIN), qandaController.findAllQandas);
router.put('/update/:id',auth(PLATFORM.ADMIN), qandaController.updateQanda);
router.delete('/soft-delete/:id',auth(PLATFORM.ADMIN), qandaController.softDeleteQanda);
router.delete('/delete/:id',auth(PLATFORM.ADMIN), qandaController.deleteQanda);


module.exports = router;