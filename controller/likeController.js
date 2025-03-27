// controllers/like.controller.js
const Like = require('../model/like');
const Post = require('../model/post');

const toggleLike = async (req, res) => {
  try {

    let reqData = req.body || {};
    const  postId  = reqData.postId;
    const userId = req.user.id; // Assuming user ID is available in req.user

    // Check if post exists

    console.log(reqData,'postid')
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user already liked/disliked the post
    let existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      // Toggle like/dislike
      existingLike.isLike = !existingLike.isLike;
      await existingLike.save();

      // Update post counts
      if (existingLike.isLike) {
        await Post.findByIdAndUpdate(postId, {
          $inc: { likeCount: 1, dislikeCount: -1 }
        });
      } else {
        await Post.findByIdAndUpdate(postId, {
          $inc: { likeCount: -1, dislikeCount: 1 }
        });
      }
    } else {
      // Create new like
      existingLike = await Like.create({ postId, userId, isLike: true });
      await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    }

    return res.status(200).json({
      success: true,
      data: existingLike,
      message: 'Like status updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};





module.exports = {
    toggleLike
}