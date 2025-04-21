const Post = require("../../model/post");
// const PostSchemaKey = require('../utils/validation/PostValidation');
// const validation = require('../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const { upload, uploadToSpaces } = require('../../services/fileUploadServices')
const User = require('../../model/user')
const Like = require('../../model/like');

const create = async (req, res) => {
  try {
    const { userId, description, location } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Upload images to Digital Ocean Spaces
    const uploadPromises = req.files.map(file => uploadToSpaces(file));
    const imageUrls = await Promise.all(uploadPromises);

    // Create new post
    const newPost = new Post({
      userId,
      posts: imageUrls.map(url => ({ pic: url })),
      description,
      location,
    });

    const savedPost = await newPost.save();

    // Push post ID to user's post array
    await User.findByIdAndUpdate(
      userId,
      { $push: { post: savedPost.id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Post created successfully",
      data: savedPost,
    });

  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};


const uploadPostImages = upload.array('images', 10); // Max 10 images

const findAllPost = async (req, res) => {
  try {
    let options = {};
    let query = {};

    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }

    if (req.body.isCountOnly) {
      const totalRecords = await Post.countDocuments(query);
      return res.success({ data: { totalRecords } });
    }

    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }

    // Step 1: Paginate posts
    const foundPosts = await Post.paginate(query, options);

    if (!foundPosts || !foundPosts.data || !foundPosts.data.length) {
      return res.recordNotFound();
    }

    // Step 2: Get all liked post IDs by the current user
    const userId = req.user.id; // assuming you attach user in middleware
    const postIds = foundPosts.data.map(post => post._id);
    
    const userLikes = await Like.find({
      postId: { $in: postIds },
      userId
    }).select('postId');

    const likedPostIds = new Set(userLikes.map(like => like.postId.toString()));

    // Step 3: Add `isLiked` field to each post
    const enrichedPosts = foundPosts.data.map(post => {
      const postObj = post.toJSON ? post.toJSON() : post;
      return {
        ...postObj,
        isLiked: likedPostIds.has(post._id.toString())
      };
    });

    // Step 4: Replace posts with enriched ones
    const response = {
      ...foundPosts,
      data: enrichedPosts
    };

    return res.success({ data: response });

  } catch (error) {
    console.error('findAllPost error:', error);
    return res.internalServerError({ message: error.message });
  }
};
   
const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id; // assuming user is set in auth middleware

    if (!ObjectId.isValid(postId)) {
      return res.validationError({ message: 'Invalid post ID.' });
    }

    const query = { _id: postId, isDeleted: false };

    // Fetch post and optionally populate things like userId or comments
    const foundPost = await Post.findOne(query)
      .populate({
        path: 'userId',
        select: 'name email' // adjust fields as per your need
      })
      .populate({
        path: 'comments',
        select: 'text userId createdAt',
        populate: { path: 'userId', select: 'name' }
      });

    if (!foundPost) {
      return res.recordNotFound();
    }

    // Check if user liked the post
    let isLiked = false;
    if (userId) {
      const like = await Like.findOne({ postId, userId });
      isLiked = !!like;
    }

    const postData = foundPost.toJSON();
    postData.isLiked = isLiked;

    return res.success({
      data: postData
    });

  } catch (error) {
    console.error('getPost error:', error);
    return res.internalServerError({ message: error.message });
  }
};
  
  const getPostCount = async (req,res) => {
    try {
      let where = {};
      let validateRequest = validation.validateFilterWithJoi(
        req.body,
        PostSchemaKey.findFilterKeys,
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `${validateRequest.message}` });
      }
      if (typeof req.body.where === 'object' && req.body.where !== null) {
        where = { ...req.body.where };
      }
      let countedPost = await Post.count(where);
      return res.success({ data : { count: countedPost } });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  const updatePost = async (req,res) => {
      try {
        let dataToUpdate = {
          ...req.body,
          updatedBy:req.user.id,
        };
        // let validateRequest = validation.validateParamsWithJoi(
        //     dataToUpdate,
        //     PostSchemaKey.updateSchemaKeys
        //   );
        //   if (!validateRequest.isValid) {
        //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        //   }
        const query = { _id:req.params.id };
        let updatedPost = await Post.findOneAndUpdate(query,dataToUpdate);
        if (!updatedPost){
          return res.recordNotFound();
        }
        return res.success({ data :updatedPost });
      } catch (error){
        return res.internalServerError({ message:error.message });
      }
    };

  const updatePostLike = async (req,res) => {
      try {
        let dataToUpdate = {};
        // let validateRequest = validation.validateParamsWithJoi(
        //     dataToUpdate,
        //     PostSchemaKey.updateSchemaKeys
        //   );
        //   if (!validateRequest.isValid) {
        //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        //   }
        const query = { _id:req.params.id };

        let findPost = await Post.findOne(query);
        if(!findPost){
          return res.recordNotFound();
        }
        if(findPost.like.includes(req.user.id)){
          let index = findPost.like.indexOf(req.user.id);
          let like = [...findPost.like];
          like.splice(index,1)
          dataToUpdate = {like:like}
        }
        else{
          let like = [...findPost.like];
          like.push(req.user.id)
          dataToUpdate = {like:like}
        }
        let updatedPost = await Post.findOneAndUpdate(query,dataToUpdate);
        if (!updatedPost){
          return res.recordNotFound();
        }
        return res.success({ data :updatedPost });
      } catch (error){
        return res.internalServerError({ message:error.message });
      }
    };
  
  const softDeletePost = async (req,res) => {
      try {
        if (!req.params.id){
          return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }
        let query = { _id:req.params.id };
        const updateBody = {
          isDeleted: true,
        };
        let updatedPost = await Post.findOneAndUpdate(query, updateBody);
        if (!updatedPost){
          return res.recordNotFound();
        }
        return res.success({ data:updatedPost });
      } catch (error){
        return res.internalServerError({ message:error.message }); 
      }
    };

  const deletePost = async (req,res) => {
    try { 
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      const query = { _id:req.params.id };
      const deletedPost = await Post.findOneAndDelete( query);
      if (!deletedPost){
        return res.recordNotFound();
      }
      return res.success({ data :deletedPost });
          
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  
  

module.exports = {
    create,
    findAllPost,
  getPost,
  getPostCount,
  updatePost,
  updatePostLike,
  softDeletePost,
  deletePost,
  uploadPostImages
}