


const dbService = require("../../utils/dbServices");
const validation = require('../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const QandaResponse = require('../../model/qandaResponse');
const QandaResponseSchemaKey = require('../../utils/validation/qandaResponseValidation');
 




  /**
 * @description : create document of QandaResponse in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created QandaResponse. {status, message, data}
 */ 
const addQandaResponse = async (req, res) => {
  try {
 
    let createdBy = req.user.id;
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

    let dataToCreate = { ...req.body,createdBy:createdBy.toString() || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      QandaResponseSchemaKey.schemaKeys
      );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }


    dataToCreate = new QandaResponse(dataToCreate);
    let createdQandaResponse = await dbService.create(QandaResponse,dataToCreate);
  
    return res.success({ data : createdQandaResponse });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of QandaResponse from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found QandaResponse. {status, message, data}
 */
const getQandaResponse = async (req,res) => {
  try {
    if (!req.params.id) {
      return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
    }
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message : 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundQandaResponse = await dbService.findOne(QandaResponse,query, options);
    if (!foundQandaResponse){
      return res.recordNotFound();
    }
    return res.success({ data :foundQandaResponse });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of QandaResponse with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated QandaResponse.
 * @return {Object} : updated QandaResponse. {status, message, data}
 */
const updateQandaResponse = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
       


      let dataToUpdate = { ...req.body };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        QandaResponseSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id: req.params.id };
      let updatedQandaResponse = await dbService.updateOne(QandaResponse, query, dataToUpdate);
      if (!updatedQandaResponse) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedQandaResponse });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of QandaResponse from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of QandaResponse.
 * @return {Object} : deactivated QandaResponse. {status, message, data}
 */
const softDeleteQandaResponse= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedQandaResponse = await dbService.updateOne(QandaResponse, query, updateBody);
      if (!updatedQandaResponse) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedQandaResponse });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of QandaResponse from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted QandaResponse. {status, message, data}
 */
const deleteQandaResponse = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedQandaResponse = await dbService.deleteOne(QandaResponse, query);
    if (!deletedQandaResponse){
      return res.recordNotFound();
    }
    return res.success({ data :deletedQandaResponse });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of QandaResponse from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found QandaResponse(s). {status, message, data}
 */
const findAllQandaResponses = async (req, res) => {
  try {
    let options = {};
    let query = {};

    // Validate request body against Joi schema
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      QandaResponseSchemaKey.findFilterKeys,
      QandaResponse.schema.obj
    );

    if (!validateRequest.isValid) {
      return res.validationError({ message: validateRequest.message });
    }

    // Apply filtering query
    if (typeof req.body.query === "object" && req.body.query !== null) {
      query = { ...req.body.query };
    }

    // Handle filtering by _id if provided in request
    if (req.body.query && req.body.query._id) {
      query._id = { $in: Array.isArray(req.body.query._id) ? req.body.query._id : [req.body.query._id] };
    }

    // Check if only count is required
    if (req.body.isCountOnly) {
      let totalRecords = await dbService.count(QandaResponse, query);
      return res.success({ data: { totalRecords } });
    }

    // Handle pagination options
    if (req.body.options && typeof req.body.options === "object") {
      options = { ...req.body.options };
    }

    // Fetch paginated QandaResponses with video population
    let foundQandaResponses = await dbService.paginate(QandaResponse, query, {
      ...options,
     
    });

    if (!foundQandaResponses || !foundQandaResponses.data || !foundQandaResponses.data.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundQandaResponses });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

   
/**
 * @description : returns total number of documents of QandaResponse.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getQandaResponseCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      QandaResponseSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedQandaResponse = await dbService.count(QandaResponse,where);
    return res.success({ data : { count: countedQandaResponse } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

 /**
 * @description : delete documents of QandaResponse in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
 const deleteManyQandaResponse = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedQandaResponse = await dbService.deleteMany(QandaResponse,query);
    if (!deletedQandaResponse){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedQandaResponse } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

  module.exports = {
    getQandaResponse,
    addQandaResponse,
    updateQandaResponse,
    deleteQandaResponse,
    softDeleteQandaResponse,
    findAllQandaResponses,
    getQandaResponseCount,
    deleteManyQandaResponse

}