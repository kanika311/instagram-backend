


const dbService = require("../../utils/dbServices");
const validation = require('../../utils/validateRequest');
const ObjectId = require('mongodb').ObjectId;
const Qanda = require('../../model/qanda');
const QandaSchemaKey = require('../../utils/validation/qandaValidation');
 




  /**
 * @description : create document of Qanda in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Qanda. {status, message, data}
 */ 
const addQanda = async (req, res) => {
  try {
 
    let createdBy = req.user.id;
    if(req.user.id.toString()!==createdBy.toString())
    return res.unAuthorized({ message: 'Unautherized User' });

    let dataToCreate = { ...req.body,createdBy:createdBy.toString() || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      QandaSchemaKey.schemaKeys
      );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }


    dataToCreate = new Qanda(dataToCreate);
    let createdQanda = await dbService.create(Qanda,dataToCreate);
  
    return res.success({ data : createdQanda });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
 

/**
 * @description : find document of Qanda from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Qanda. {status, message, data}
 */
const getQanda = async (req,res) => {
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
    let foundQanda = await dbService.findOne(Qanda,query, options);
    if (!foundQanda){
      return res.recordNotFound();
    }
    return res.success({ data :foundQanda });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};

  /**
 * @description : update document of Qanda with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Qanda.
 * @return {Object} : updated Qanda. {status, message, data}
 */
const updateQanda = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
          }
       


      let dataToUpdate = { ...req.body };
      let validateRequest = validation.validateParamsWithJoi(
        dataToUpdate,
        QandaSchemaKey.updateSchemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
      }
      const query = { _id: req.params.id };
      let updatedQanda = await dbService.updateOne(Qanda, query, dataToUpdate);
      if (!updatedQanda) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedQanda });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

  /**
 * @description : deactivate document of Qanda from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Qanda.
 * @return {Object} : deactivated Qanda. {status, message, data}
 */
const softDeleteQanda= async (req, res) => {
    try {
      if (!req.params.id) {
        return res.badRequest({ message: 'Insufficient request parameters! id is required.' });
      }
      
      const query = { _id: req.params.id };
      const updateBody = { isDeleted: true,isActive:false };
      let updatedQanda = await dbService.updateOne(Qanda, query, updateBody);
      if (!updatedQanda) {
        return res.recordNotFound();
      }
      return res.success({ data: updatedQanda });
    } catch (error) {
      return res.internalServerError({ message: error.message });
    }
  };

    /**
 * @description : delete document of Qanda from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Qanda. {status, message, data}
 */
const deleteQanda = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedQanda = await dbService.deleteOne(Qanda, query);
    if (!deletedQanda){
      return res.recordNotFound();
    }
    return res.success({ data :deletedQanda });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
      
/**
 * @description : find all documents of Qanda from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Qanda(s). {status, message, data}
 */
const findAllQandas = async (req, res) => {
  try {
    let options = {};
    let query = {};

    // Validate request body against Joi schema
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      QandaSchemaKey.findFilterKeys,
      Qanda.schema.obj
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
      let totalRecords = await dbService.count(Qanda, query);
      return res.success({ data: { totalRecords } });
    }

    // Handle pagination options
    if (req.body.options && typeof req.body.options === "object") {
      options = { ...req.body.options };
    }

    // Fetch paginated Qandas with video population
    let foundQandas = await dbService.paginate(Qanda, query, {
      ...options,
     
    });

    if (!foundQandas || !foundQandas.data || !foundQandas.data.length) {
      return res.recordNotFound();
    }

    return res.success({ data: foundQandas });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

   
/**
 * @description : returns total number of documents of Qanda.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getQandaCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      QandaSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedQanda = await dbService.count(Qanda,where);
    return res.success({ data : { count: countedQanda } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

 /**
 * @description : delete documents of Qanda in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
 const deleteManyQanda = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedQanda = await dbService.deleteMany(Qanda,query);
    if (!deletedQanda){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedQanda } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

  module.exports = {
    getQanda,
    addQanda,
    updateQanda,
    deleteQanda,
    softDeleteQanda,
    findAllQandas,
    getQandaCount,
    deleteManyQanda

}