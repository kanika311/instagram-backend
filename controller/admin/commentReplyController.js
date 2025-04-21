// controllers/commentReply.controller.js
const CommentReply = require('../../model/commentReply');
const Comment = require('../../model/comment');


const addReply = async (req, res) => {
  try {
    const { commentId } = req.body;
    const { text } = req.body;
    const userId = req.user.id;

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const reply = await CommentReply.create({ commentId, userId, text });

    return res.status(201).json({
      success: true,
      data: reply,
      message: 'Reply added successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getRepliesForComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const replies = await CommentReply.find({ commentId, isDeleted: false })
      .populate('userId', 'username profilePic') // Adjust fields as needed
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: replies,
      message: 'Replies retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.id;

    const reply = await CommentReply.findOneAndUpdate(
      { _id: replyId, userId },
      { isDeleted: true },
      { new: true }
    );

    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



module.exports = {
  addReply,
  getRepliesForComment,
  deleteReply
}