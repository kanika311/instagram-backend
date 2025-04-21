// controllers/like.controller.js
const Like = require('../model/like');
const Post = require('../model/post');

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }

    let existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      // Unlike (delete the like)
      await existingLike.deleteOne();

      // Decrease like count and set isLiked false
      await Post.findByIdAndUpdate(postId, {
        $inc: { likeCount: -1 },
        isLiked: false
      });

      const updatedPost = await Post.findById(postId).populate('userId').lean();

      return res.status(200).json({
        success: true,
        message: "Post unliked",
        isLiked: false,
        like: {
          postId: updatedPost,
          userId,
          isLike: false
        }
      });
    } else {
      // Like the post
      const newLike = await Like.create({ postId, userId, isLike: true });

      // Increase like count and set isLiked true
      await Post.findByIdAndUpdate(postId, {
        $inc: { likeCount: 1 },
        isLiked: true
      });

      const updatedPost = await Post.findById(postId).populate('userId').lean();

      return res.status(200).json({
        success: true,
        message: "Post liked",
        isLiked: true,
        like: {
          postId: updatedPost,
          userId,
          isLike: true,
          createdAt: newLike.createdAt,
          updatedAt: newLike.updatedAt,
          id: newLike._id
        }
      });
    }

  } catch (error) {
    console.error("Error in toggleLike:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};




module.exports = {
    toggleLike
}