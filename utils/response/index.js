
module.exports = {
    success: (data = {}) => ({
      status: "SUCCESS",
      message: data.message || 'Your request is successfully executed',
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  
    failure: (data = {}) => ({
      status: "FAILURE",
      message: data.message || 'Some error occurred while performing action.',
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  
    internalServerError: (data = {}) => ({
      status: "SERVER_ERROR",
      message: data.message || 'Internal server error.',
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  
    badRequest: (data = {}) => ({
      status: "BAD_REQUEST",
      message: data.message || 'Request parameters are invalid or missing.',
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  
    recordNotFound: (data = {}) => ({
      status: "RECORD_NOT_FOUND",
      message: data.message || 'Record(s) not found with specified criteria.',
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  
    validationError: (data = {}) => ({
      status: "VALIDATION_ERROR",
      message: data.message || `Invalid Data, Validation Failed.`,
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  
    unAuthorized: (data = {}) => ({
      status: "UNAUTHORIZED",
      message: data.message || 'You are not authorized to access the request',
      data: data.data && Object.keys(data.data).length ? data.data : null,
    }),
  };
  