/**
 * responseHandler.js
 * @description :: exports all handlers for response format.
 */
const responseBody = require('./index');

/**
 *
 * @param {obj} req : request from controller.
 * @param {obj} res : response from controller.
 * @param {*} next : executes the middleware succeeding the current middleware.
 */
const responseHandler = (req, res, next) => {
  res.success = (data = {}) => {
    res.status(200).json(responseBody.success(data));
  };
  res.failure = (data = {}) => {
    res.status(200).json(responseBody.failure(data));
  };
  res.internalServerError = (data = {}) => {
    res.status(500).json(responseBody.internalServerError(data));
  };
  res.badRequest = (data = {}) => {
    res.status(400).json(responseBody.badRequest(data));
  };
  res.recordNotFound = (data = {}) => {
    res.status(200).json(responseBody.recordNotFound(data));
  };
  res.validationError = (data = {}) => {
    res.status(422).json(responseBody.validationError(data));
  };
  res.unAuthorized = (data = {}) => {
    res.status(401).json(responseBody.unAuthorized(data));
  };
  next();
};

module.exports = responseHandler;
