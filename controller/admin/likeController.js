// controllers/like.controller.js
const Like = require('../../model/like');
const Post = require('../../model/post');

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }

    // Check if the user already liked the post
    let existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();

      // Decrement likeCount
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });

      // Get updated post data
      const updatedPost = await Post.findById(postId)
        .populate('userId', 'name') // populate any fields you need
        .lean();

      return res.status(200).json({
        success: true,
        message: "Post unliked",
        isLiked: false,
        like: null,
        post: updatedPost,
      });
    } else {
      // Like the post
      const newLike = await Like.create({ postId, userId, isLike: true });

      // Increment likeCount
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });

      // Get updated post data
      const updatedPost = await Post.findById(postId)
        .populate('userId', 'name') // populate any fields you need
        .lean();

      return res.status(200).json({
        success: true,
        message: "Post liked",
        isLiked: true,
        like: newLike,
        post: updatedPost,
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