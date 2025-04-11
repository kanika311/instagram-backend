// controllers/like.controller.js
const Like = require('../model/like');
const Post = require('../model/post');

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id; // Assuming authenticated user ID

    if (!postId) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if user already liked/disliked the post
    let existingLike = await Like.findOne({ postId, userId });

    let updatedLikeStatus;
    if (existingLike) {
      // Toggle like status
      existingLike.isLike = !existingLike.isLike;
      await existingLike.save();
      updatedLikeStatus = existingLike.isLike;

      // Update post's like/dislike count accordingly
      await Post.findByIdAndUpdate(postId, {
        $inc: {
          likeCount: existingLike.isLike ? 1 : -1,
          dislikeCount: existingLike.isLike ? -1 : 1,
        },
      });
    } else {
      // Create new like entry
      existingLike = await Like.create({ postId, userId, isLike: true });
      updatedLikeStatus = true;

      // Increment like count
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    }

    // Update `isLiked` status per user in the Post schema
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { isLiked: updatedLikeStatus },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: existingLike,
      post: updatedPost,
      message: "Like status updated successfully",
    });
  } catch (error) {
    console.error("Error in toggleLike:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};






module.exports = {
    toggleLike
}