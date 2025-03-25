const chat = require("../model/chat");
const Chat = require("../model/chat");
// const ChatSchemaKey = require('../utils/validation/ChatValidation');
// const validation = require('../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;

const create = async(req,res) => {

    try {
        let reqData = req.body || {};
        if(!reqData.users || !(reqData.users.length>=2) || !reqData.message){
            return res.badRequest({message : "Insufficient request parameters! users is required"}) 
        }

        let checkChat = await chat.findOne({})

        if(reqData.users.length>2)
          reqData.isGroup = true;

        reqData.createBy = req.user._id;


        
        // let validateRequest = validation.validateParamsWithJoi(
        //     reqData,
        //     ChatSchemaKey.schemaKeys);
        //   if (!validateRequest.isValid) {
        //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        //   }

        // const check = {
        //     userId: reqData.userId,
        //     title:reqData?.title,
        //     publishedDate: reqData?.publishedDate,
        //     description: reqData?.description,
        // }

        // let ChatCheck = await Chat.findOne(check)
        // console.log("ChatCheck",ChatCheck);
        // if(ChatCheck){
        //     return res.badRequest({message : "Product already in Your Chat"})
        // }
        // reqData = {...reqData, ChatValue: req.files}
        let dataToCreate = new Chat(reqData);
        let createdData = await Chat.create(dataToCreate)
        
        return res.success({ data : createdData });
  

    } catch (error) {
        console.log("Chat create", error);
        return res.internalServerError({ message: "Internal Server Error" });
    }
}

const findAllChat = async (req,res) => {
    try {
      let page = 1;
      let limit = 10;

      if(req.query.page && Number(req.query.page)>0)
          page = Number(req.query.page)
        if(req.query.limit && Number(req.query.limit)>0)
          limit = Number(req.query.limit)

      // let validateRequest = validation.validateFilterWithJoi(
      //   req.body,
      //   ChatSchemaKey.findFilterKeys,
      //   Chat.schema.obj
      // );
      // if (!validateRequest.isValid) {
      //   return res.validationError({ message: `${validateRequest.message}` });
      // }

      // const foundChats = await Chat.aggregate([
      //   // Match the document containing the desired user ID
      //   {
      //     $match: { $and: [
      //       { users: { $in: [req.body.userId] } },
      //       {isDeleted: false}
      //      ] // Optionally, filter out deleted chats
      //     }
      //   },
      //   // Lookup to populate the last message
      //   // {
      //   //   $lookup: {
      //   //     from: "message", // Assuming messages collection name
      //   //     localField: "messages",
      //   //     foreignField: "_id",
      //   //     as: "last_message"
      //   //   }
      //   // },
      //   // // Unwind the messages array to get each message as a separate document
      //   // {
      //   //   $unwind: {
      //   //     path: "$last_message",
      //   //     preserveNullAndEmptyArrays: true // Preserve documents even if there's no matching message
      //   //   }
      //   // },
      //   // // Sort by message createdAt descending to get the last message
      //   // {
      //   //   $sort: {
      //   //     "last_message.createdAt": -1
      //   //   }
      //   // },
      //   // Group back to chat document level
      //   {
      //     $group: {
      //       _id: "$_id",
      //       users: { $first: "$users" },
      //       messages: { $push: "$messages" }, // Push all messages into an array
      //       admin: { $first: "$admin" },
      //       createBy: { $first: "$createBy" },
      //       isGroup: { $first: "$isGroup" },
      //       createdAt: { $first: "$createdAt" },
      //       updatedAt: { $first: "$updatedAt" },
      //     }
      //   },
      //   // Lookup to populate users with specified fields
      //   // {
      //   //   $lookup: {
      //   //     from: "user", // Assuming users collection name
      //   //     localField: "user",
      //   //     foreignField: "_id",
      //   //     as: "users"
      //   //   }
      //   // },
      //   // // Unwind users array
      //   // {
      //   //   $unwind: "$users"
      //   // },
      //   // // Project to include only desired fields for users
      //   // {
      //   //   $project: {
      //   //     _id: 1,
      //   //     messages: 1,
      //   //     admin: 1,
      //   //     createBy: 1,
      //   //     isGroup: 1,
      //   //     createdAt: 1,
      //   //     updatedAt: 1,
      //   //     "users.name": 1,
      //   //     "users.username": 1,
      //   //     "users.Bio": 1,
      //   //     "users.picture": 1
      //   //   }
      //   // },
      //   // // Group back to chat document level
      //   // {
      //   //   $group: {
      //   //     _id: "$_id",
      //   //     users: { $push: "$users" },
      //   //     messages: { $first: "$messages" },
      //   //     admin: { $first: "$admin" },
      //   //     createBy: { $first: "$createBy" },
      //   //     isGroup: { $first: "$isGroup" },
      //   //     createdAt: { $first: "$createdAt" },
      //   //     updatedAt: { $first: "$updatedAt" },
      //   //   }
      //   // },
      //   // Skip and Limit for pagination
      //   // {
      //   //   $skip: 0 // specify the number of documents to skip
      //   // },
      //   // {
      //   //   $limit: 10 // specify the maximum number of documents to return
      //   // }
      // ]);

      const foundChats = await Chat.find({users: {$in: [req.user.id]}},{"messages": {$slice: -1}}).populate("users",{"name": 1, "username": 1, "Bio": 1, "picture": 1}).populate("messages").skip((page - 1)*limit).limit(limit);
      // if (typeof req.body.query === 'object' && req.body.query !== null) {
      //   query = { ...req.body.query };
      // }
      // if (req.body.isCountOnly){
      //   let totalRecords = await Chat.countDocuments(query);
      //   return res.success({ data: { totalRecords } });
      // }
      // if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      //   options = { ...req.body.options };
      // }
      // let foundChats = await Chat.paginate(query,options);
      if (!foundChats || !foundChats.length){
        return res.recordNotFound(); 
      }
      return res.success({ data :foundChats });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };
   
  const getChat = async (req,res) => {
      try {
        let query = {};
        if (!ObjectId.isValid(req.params.id)) {
            return res.validationError({ message : 'invalid objectId.' });
          }
        query._id = req.params.id;
        query.isDeleted = false
        let options = {};
        let foundChat = await Chat.findOne(query, options);
        if (!foundChat){
          return res.recordNotFound();
        }
        return res.success({ data :foundChat });
      }
      catch (error){
        return res.internalServerError({ message:error.message });
      }
    };
  
  const getChatCount = async (req,res) => {
    try {
      let where = {};
      let validateRequest = validation.validateFilterWithJoi(
        req.body,
        ChatSchemaKey.findFilterKeys,
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `${validateRequest.message}` });
      }
      if (typeof req.body.where === 'object' && req.body.where !== null) {
        where = { ...req.body.where };
      }
      let countedChat = await Chat.count(where);
      return res.success({ data : { count: countedChat } });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  const updateChat = async (req,res) => {
      try {
        let dataToUpdate = {
          ...req.body
        };

        // console.log();

        // let validateRequest = validation.validateParamsWithJoi(
        //     dataToUpdate,
        //     ChatSchemaKey.updateSchemaKeys
        //   );
        //   if (!validateRequest.isValid) {
        //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        //   }
        const query = { _id:req.params.id };
        let updatedChat = await Chat.findOneAndUpdate(query,dataToUpdate);
        if (!updatedChat){
          return res.recordNotFound();
        }
        return res.success({ data :updatedChat });
      } catch (error){
        return res.internalServerError({ message:error.message });
      }
    };

  
  const softDeleteChat = async (req,res) => {
      try {
        if (!req.params.id){
          return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }
        let query = { _id:req.params.id };
        const updateBody = {
          isDeleted: true,
        };
        let updatedChat = await Chat.findOneAndUpdate(query, updateBody);
        if (!updatedChat){
          return res.recordNotFound();
        }
        return res.success({ data:updatedChat });
      } catch (error){
        return res.internalServerError({ message:error.message }); 
      }
    };

  const deleteChat = async (req,res) => {
    try { 
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      const query = { _id:req.params.id };
      const deletedChat = await Chat.findOneAndDelete( query);
      if (!deletedChat){
        return res.recordNotFound();
      }
      return res.success({ data :deletedChat });
          
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  
  

module.exports = {
    create,
    findAllChat,
  getChat,
  getChatCount,
  updateChat,
  softDeleteChat,
  deleteChat,
}