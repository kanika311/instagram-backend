const User = require("../model/user");
const UserSchemaKey = require('../utils/validation/userValidation');
const validation = require('../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const dbService = require('../utils/dbServices');
const { upload, uploadToSpaces } = require('../services/fileUploadServices')


const findAllUser = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      UserSchemaKey.findFilterKeys,
      User.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    query._id = { $ne: req.user.id };
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
    console.log(query)
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(User, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundUsers = await dbService.paginate( User,query,options);
    if (!foundUsers || !foundUsers.data || !foundUsers.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundUsers });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
   
const me = async (req, res) => {
  try {
    const query = {
      _id: req.user.id,
      isDeleted: false,
      isActive: true
    };

    const foundUser = await User.findOne(query).populate({
      path: 'post',
      model: 'post', // Replace with your actual Post model name if different
      select: 'description location posts createdAt' // Optional: select only specific fields
    });

    if (!foundUser) {
      return res.recordNotFound();
    }

    return res.success({ data: foundUser });
  } catch (error) {
    console.error("Error in /me:", error);
    return res.internalServerError({ message: error.message });
  }
};

  const getProfileInfo = async (req,res) => {
      try {
        let query = {};
        if(!req.query.username || !req.query.searchBy){
            return res.badRequest({message : "Insufficient request parameters! username and searchBy is required"}) 
        }
        query.username = req.query.username;
        query.isDeleted = false
        let options = {};
        let foundUser = await User.findOne(query, options).populate("followers","username");
        if (!foundUser){
          return res.recordNotFound();
        }
        if(foundUser.blockedUser.includes(req.query.searchBy)){
          return res.unAuthorized({ message: `you have bloked by ${req.query.username}` });
        }
        let searchByUser = await User.findOne({_id: req.query.searchBy}, options).populate("followers","username");
        let postCount = await User.countDocuments({_id:foundUser._id,isDeleted: false});
        const commonFollowers = foundUser.followers.filter(id => searchByUser.followers.includes(id));
        let mutual_followers = [];
        for (let index = 0; index < mutual_followers.length; index++) {
          if(index===3)
            break;
          mutual_followers.push(commonFollowers[index])
        }
        
        const followersUsernames = foundUser.followers.map(item => item.username);

        let data = {
            username: foundUser.username,
            name: foundUser.name,
            picture: foundUser?.picture,
            postCount: postCount,
            isPrivate: foundUser.isPrivate,
            follow_by_viewer: followersUsernames?.includes(searchByUser.username),
            requested_by_viewer: foundUser?.requestes?.includes(req.query.searchBy),
            isRestricted: false,
            followersCount: foundUser.followers.length,
            followingCount: foundUser.following.length,
            mutual_followers:{
                count: commonFollowers.length,
                user: mutual_followers
            }
        }
        if(foundUser.isPrivate && !foundUser.followers.includes(req.query.searchBy)){
            data.isRestricted = true;
            return res.success({ data :data });
        }

        return res.success({ data :data });
      }
      catch (error){
        return res.internalServerError({ message:error.message });
      }
    };
  
  const getUserCount = async (req,res) => {
    try {
      let where = {};
    //   let validateRequest = validation.validateFilterWithJoi(
    //     req.body,
    //     UserSchemaKey.findFilterKeys,
    //   );
    //   if (!validateRequest.isValid) {
    //     return res.validationError({ message: `${validateRequest.message}` });
    //   }
      if (typeof req.body.where === 'object' && req.body.where !== null) {
        where = { ...req.body.where };
      }
      let countedUser = await User.count(where);
      return res.success({ data : { count: countedUser } });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  const updateUser = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
        if(req.body.password)
        return res.validationError({ message: `Password is not update this method` });

        // if(req.params.id){
        //     if(req.user.id.toString()!==req.params.id)
        //         return res.unAuthorized({ message: 'Unautherized User' });
        //   }

      let dataToUpdate = { ...req.body, };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        UserSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
        // check data availble in database or not
    
        if(req.body.email){
          let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['email'],dataToUpdate,'REGISTER');
          if (checkUniqueFields.isDuplicate){
            return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
          }
      }
      if(req.body.phone){
          let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['phone'],dataToUpdate,'REGISTER');
        if (checkUniqueFields.isDuplicate){
          return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
        }
      }
  
      const query = { _id: req.params.id };
      let updatedUser = await dbService.updateOne(User, query, dataToUpdate);
      if (!updatedUser) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedUser });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  
  const softDeleteUser = async (req,res) => {
      try {
        if (!req.params.id){
          return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }
        if(req.user.id !== req.params.id){
          res.unAuthorized();
        }
        let query = { _id:req.params.id };
        const updateBody = {
          isDeleted: true,
        };
        let updatedUser = await User.findOneAndUpdate(query, updateBody);
        if (!updatedUser){
          return res.recordNotFound();
        }
        return res.success({ data:updatedUser });
      } catch (error){
        return res.internalServerError({ message:error.message }); 
      }
    };

  const deleteUser = async (req,res) => {
    try { 
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      if(req.user.id !== req.params.id){
        res.unAuthorized();
      }
      const query = { _id:req.params.id };
      const deletedUser = await User.findOneAndDelete( query);
      if (!deletedUser){
        return res.recordNotFound();
      }
      return res.success({ data :deletedUser });
          
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  
  const uploadProfilePicture = async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: "Profile picture is required" });
      }
  
      // Upload the file to Digital Ocean Spaces
      const imageUrl = await uploadToSpaces(req.file);
  
      // Update the user's picture field
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { picture: imageUrl },
        { new: true }
      ).select('-password'); // Exclude password from the response
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ 
        message: "Profile picture updated successfully", 
        data: updatedUser 
      });
  
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return res.status(500).json({ 
        message: error.message || "Internal Server Error" 
      });
    }
  };
  
  const uploadMiddleware = upload.single('profilePicture');

module.exports = {
  me,
getProfileInfo,
  getUserCount,
  updateUser,
  softDeleteUser,
  deleteUser,
  uploadProfilePicture,
  uploadMiddleware,
  findAllUser
}