/**
 * codeValidation.js
 * @description :: Validate each POST, PUT, and filter request as per the Code model.
 */

const joi = require("joi");
const { options, isCountOnly, populate, select } = require("./comonFilterValidation");

/** Validation keys and properties for the Code model */
exports.schemaKeys = joi
  .object({
   
    // questionText: joi.string(),
      userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required("userId is required"),
      questionId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required("questionId is required"),
     description:joi.string(),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
  })
  .unknown(true);

/** Validation keys and properties of the Code model for updating */
exports.updateSchemaKeys = joi
  .object({
   
  
    userId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required("userId is required"),
    questionId: joi.string().regex(/^[0-9a-fA-F]{24}$/).required("questionId is required"),
     description:joi.string(),
    isActive: joi.boolean(),
    isDeleted: joi.boolean(),
    createdBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    // updatedBy: joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null).allow(""),
    _id: joi.string().regex(/^[0-9a-fA-F]{24}$/),
  })
  .unknown(true);

/** Validation keys and properties for filtering documents */
let keys = ["query", "where"];
exports.findFilterKeys = joi
  .object({
    options: options,
    ...Object.fromEntries(
      keys.map((key) => [
        key,
        joi
          .object({
            question: joi.alternatives().try(
              joi.array().items(joi.string()),
              joi.string(),
              joi.object()
            ),
            isActive: joi.alternatives().try(
              joi.array().items(joi.boolean()),
              joi.boolean(),
              joi.object()
            ),
            isDeleted: joi.alternatives().try(
              joi.array().items(joi.boolean()),
              joi.boolean(),
              joi.object()
            ),
            
            createdBy: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            userId: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
           
            
            updatedBy: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
            id: joi.any(),
            _id: joi.alternatives().try(
              joi.array().items(joi.string().regex(/^[0-9a-fA-F]{24}$/)),
              joi.string().regex(/^[0-9a-fA-F]{24}$/),
              joi.object()
            ),
          })
          .unknown(true),
      ])
    ),
    isCountOnly: isCountOnly,
    populate: joi.array().items(populate),
    select: select,
  })
  .unknown(true);
