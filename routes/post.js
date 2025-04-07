const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const likeController = require ("../controller/likeController")
const commentController = require("../controller/commentController")
const replyController = require('../controller/commentReplyController')
const {PLATFORM} = require("../constants/authConstant");
const auth = require("../middleware/auth");
const storage = require("../middleware/upload");
const multer = require("multer");
const upload = require('../config/doSpace')

const uploadStorage = multer({ storage: storage })


router.post('/create',auth(PLATFORM.USERAPP), postController.uploadPostImages,postController.create);
router.post('/list',auth(PLATFORM.USERAPP), postController.findAllPost);
router.get('/get/:id',auth(PLATFORM.USERAPP), postController.getPost);
router.put('/update/:id',auth(PLATFORM.USERAPP), uploadStorage.array("file", 10), postController.updatePost);
router.put('/update-like/:id',auth(PLATFORM.USERAPP), postController.updatePostLike);
router.delete('/soft-delete/:id',auth(PLATFORM.USERAPP), postController.softDeletePost);
router.delete('/delete/:id',auth(PLATFORM.USERAPP), postController.deletePost);
router.post('/like',auth(PLATFORM.USERAPP),likeController.toggleLike)
router.post('/comment',auth(PLATFORM.USERAPP),commentController.addComment)
router.delete('/deleteComment/:id',auth(PLATFORM.USERAPP),commentController.deleteComment)
router.post('/commentreply',auth(PLATFORM.USERAPP),replyController.addReply)
router.post('/commentlist/:postId',auth(PLATFORM.USERAPP),commentController.getCommentsForPost)

module.exports = router;