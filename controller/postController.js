const Post = require("../model/post");
// const PostSchemaKey = require('../utils/validation/PostValidation');
// const validation = require('../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;

const create = async(req,res) => {
  let files = [];
    try {
        let reqData = req.body || {};
        if(!reqData.userId){
          reqData.userId = req.user.id;
        }
        // let validateRequest = validation.validateParamsWithJoi(
        //     reqData,
        //     PostSchemaKey.schemaKeys);
        //   if (!validateRequest.isValid) {
        //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        //   }

        // const check = {
        //     userId: reqData.userId,
        //     title:reqData?.title,
        //     publishedDate: reqData?.publishedDate,
        //     description: reqData?.description,
        // }

        // let PostCheck = await Post.findOne(check)
        // console.log("PostCheck",PostCheck);
        // if(PostCheck){
        //     return res.badRequest({message : "Product already in Your Post"})
        // }
        reqData = {...reqData, postValue: req.files}
        let dataToCreate = new Post(reqData);
        let createdData = await Post.create(dataToCreate)
        
        return res.success({ data : createdData });
  

    } catch (error) {
        console.log("Post create", error);
        return res.internalServerError({ message: "Internal Server Error" });
    }
}

const findAllPost = async (req,res) => {
    try {
      let options = {};
      let query = {};

      // let validateRequest = validation.validateFilterWithJoi(
      //   req.body,
      //   PostSchemaKey.findFilterKeys,
      //   Post.schema.obj
      // );
      // if (!validateRequest.isValid) {
      //   return res.validationError({ message: `${validateRequest.message}` });
      // }

      if (typeof req.body.query === 'object' && req.body.query !== null) {
        query = { ...req.body.query };
      }
      if (req.body.isCountOnly){
        let totalRecords = await Post.countDocuments(query);
        return res.success({ data: { totalRecords } });
      }
      if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
        options = { ...req.body.options };
      }
      let foundPosts = await Post.paginate(query,options);
      if (!foundPosts || !foundPosts.data || !foundPosts.data.length){
        return res.recordNotFound(); 
      }
      return res.success({ data :foundPosts });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };
   
  const getPost = async (req,res) => {
      try {
        let query = {};
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message : 'invalid objectId.' });
          }
        query._id = req.params.id;
        query.isDeleted = false
        let options = {};
        let foundPost = await Post.findOne(query, options);
        if (!foundPost){
          return res.recordNotFound();
        }
        return res.success({ data :foundPost });
      }
      catch (error){
        return res.internalServerError({ message:error.message });
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
}