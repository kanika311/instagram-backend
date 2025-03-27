// controllers/comment.controller.js
const Comment = require('../model/comment');
const Post = require('../model/post');

const addComment = async (req, res) => {
  try {
    const {postId}= req.body;
    const  {text} = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({ postId, userId, text });
    
    // Increment comment count
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    return res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId, isDeleted: false })
      .populate('userId', 'username profilePic') // Adjust fields as needed
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: comments,
      message: 'Comments retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;


    // console.log(id,'commentid')
    const comment = await Comment.findOneAndUpdate(
      { _id: id, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
    }

    // Decrement comment count
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
    addComment,
    getCommentsForPost,
    deleteComment
}