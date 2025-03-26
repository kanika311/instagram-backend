/**
 * authConstant.js
 * @description :: constants used in authentication
 */

const JWT = {
  USERAPP_SECRET: 'blogjwtuserappv1secret',
  ADMIN_SECRET: 'blogjwtadminv1secret',
  EXPIRES_IN: 10000*60,  
  REFRESH_TOKEN_EXPIRE_IN : 10000*60*60*24*7,
};

const USER_TYPES = {
  User: 1,
  Admin: 2,
};


const PLATFORM = {
  USERAPP: 1,
  ADMIN: 2,
};

let LOGIN_ACCESS = {
  [USER_TYPES.User]: [PLATFORM.USERAPP],
  [USER_TYPES.Admin]: [PLATFORM.ADMIN],
};

const FORGOT_PASSWORD_WITH = {
  LINK: {
    sms: false,
    email: true
  },
  EXPIRE_TIME: 10
};

const MAX_LOGIN_RETRY_LIMIT = 5;
const LOGIN_REACTIVE_TIME = 2;


module.exports = {
  JWT,
  USER_TYPES,
  PLATFORM,
  MAX_LOGIN_RETRY_LIMIT,
  LOGIN_REACTIVE_TIME,
  LOGIN_ACCESS,
  FORGOT_PASSWORD_WITH
};