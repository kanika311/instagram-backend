const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const {PLATFORM} = require("../constants/authConstant");
const auth = require("../middleware/auth");
const storage = require("../middleware/upload");
const multer = require("multer");

const uploadStorage = multer({ storage: storage })


router.post('/create',auth(PLATFORM.USERAPP), uploadStorage.array("file", 10),postController.create);
router.post('/list',auth(PLATFORM.USERAPP), postController.findAllPost);
router.get('/get/:id',auth(PLATFORM.USERAPP), postController.getPost);
router.put('/update/:id',auth(PLATFORM.USERAPP), uploadStorage.array("file", 10), postController.updatePost);
router.put('/update-like/:id',auth(PLATFORM.USERAPP), postController.updatePostLike);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), postController.softDeletePost);
router.delete('/delete/:id',auth(PLATFORM.USERAPP), postController.deletePost);

module.exports = router;