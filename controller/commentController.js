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
    let options = {};
    let query = { postId: req.params.postId, isDeleted: false };

    // Handle query merging
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...query, ...req.body.query };
    }

    // Handle countOnly request
    if (req.body.isCountOnly) {
      let totalRecords = await Comment.countDocuments(query);
      return res.success({ data: { totalRecords } });
    }

    // Set up options
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { 
        ...req.body.options,
        populate: [
          {
            path: 'userId',
            select: 'name picture'
          },
          {
            path: 'replies',
            populate: {
              path: 'userId',
              select: 'name picture'
            },
            options: { sort: { createdAt: -1 } }
          }
        ],
        sort: { createdAt: -1 }
      };
    } else {
      options = {
        populate: [
          {
            path: 'userId',
            select: 'name picture'
          },
          {
            path: 'replies',
            populate: {
              path: 'userId',
              select: 'name picture'
            },
            options: { sort: { createdAt: -1 } }
          }
        ],
        sort: { createdAt: -1 }
      };
    }

    // Apply default pagination if not specified
    if (!options.page) options.page = 1;
    if (!options.limit) options.limit = 10;

    // Execute paginated query
    let foundComments = await Comment.paginate(query, options);

    if (!foundComments || !foundComments.data || !foundComments.data.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundComments });
  } catch (error) {
    return res.internalServerError({ message: error.message });
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