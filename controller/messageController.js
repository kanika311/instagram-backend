const Message = require("../model/message");

// const create = async(req,res) => {

//     try {
//         let reqData = req.body || {};
//         if(!reqData.users && !(reqData.users.length>=2) && !reqData.createBy){
//             return res.badRequest({message : "Insufficient request parameters! users is required"}) 
//         }

//         if(reqData.users.length>2)
//           reqData.isGroup = true;
        
//         // let validateRequest = validation.validateParamsWithJoi(
//         //     reqData,
//         //     MessageSchemaKey.schemaKeys);
//         //   if (!validateRequest.isValid) {
//         //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
//         //   }

//         // const check = {
//         //     userId: reqData.userId,
//         //     title:reqData?.title,
//         //     publishedDate: reqData?.publishedDate,
//         //     description: reqData?.description,
//         // }

//         // let MessageCheck = await Message.findOne(check)
//         // console.log("MessageCheck",MessageCheck);
//         // if(MessageCheck){
//         //     return res.badRequest({message : "Product already in Your Message"})
//         // }
//         // reqData = {...reqData, MessageValue: req.files}
//         let dataToCreate = new Message(reqData);
//         let createdData = await Message.create(dataToCreate)
        
//         return res.success({ data : createdData });
  

//     } catch (error) {
//         console.log("Message create", error);
//         return res.internalServerError({ message: "Internal Server Error" });
//     }
// }

const findAllMessage = async (req,res) => {
    try {
      let page = 1;
      let limit = 10;

      if(req.query.page && Number(req.query.page)>0)
          page = Number(req.query.page)
        if(req.query.limit && Number(req.query.limit)>0)
          limit = Number(req.query.limit)
        
      let query = {chatId: req.params.chatId};
       const message = await Message.find(query).sort({createdAt:1}).skip((page - 1)*limit).limit(limit); 

      return res.success({ data :message });
    } catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  const updateMessage = async (req,res) => {
      try {
        let dataToUpdate = {
          ...req.body
        };

        // console.log();

        // let validateRequest = validation.validateParamsWithJoi(
        //     dataToUpdate,
        //     MessageSchemaKey.updateSchemaKeys
        //   );
        //   if (!validateRequest.isValid) {
        //     return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
        //   }
        const query = { _id:req.params.id };
        let updatedMessage = await Message.findOneAndUpdate(query,dataToUpdate);
        if (!updatedMessage){
          return res.recordNotFound();
        }
        return res.success({ data :updatedMessage });
      } catch (error){
        return res.internalServerError({ message:error.message });
      }
    };

  
  const softDeleteMessage = async (req,res) => {
      try {
        if (!req.params.id){
          return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
        }
        let query = { _id:req.params.id };
        const updateBody = {
          isDeleted: true,
        };
        let updatedMessage = await Message.findOneAndUpdate(query, updateBody);
        if (!updatedMessage){
          return res.recordNotFound();
        }
        return res.success({ data:updatedMessage });
      } catch (error){
        return res.internalServerError({ message:error.message }); 
      }
    };

  const deleteMessage = async (req,res) => {
    try { 
      if (!req.params.id){
        return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
      }
      const query = { _id:req.params.id };
      const deletedMessage = await Message.findOneAndDelete( query);
      if (!deletedMessage){
        return res.recordNotFound();
      }
      return res.success({ data :deletedMessage });
          
    }
    catch (error){
      return res.internalServerError({ message:error.message });
    }
  };

  
  

module.exports = {
    findAllMessage,
  updateMessage,
  softDeleteMessage,
  deleteMessage,
}