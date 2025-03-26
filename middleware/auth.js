const passport = require('passport');
const { LOGIN_ACCESS, PLATFORM } = require('../constants/authConstant');
const userTokens = require('../model/userTokens');
const dbService = require('../utils/dbServices');

const verifyCallback = (req, resolve, reject, platform) => async (error, user, info) => {
  console.log("Auth Headers:", req.headers.authorization); // Debugging
  console.log("User:", user);
  console.log("Info:", info);
  console.log("Error:", error);

  if (error) {
    console.error("Passport Error:", error);
    return reject('Authentication error');
  }
  if (info) {
    console.warn("Passport Info:", info);
    return reject(info.message || 'Unauthorized User');
  }
  if (!user) {
    return reject('Unauthorized User');
  }

  req.user = user;

  if (!user.isAppUser || user.isDeleted) {
    return reject('User is deactivated');
  }

  let token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null;
  if (!token) {
    return reject('No token provided');
  }

  let userToken = await dbService.findOne(userTokens, {
    token,
    userId: user.id
  });

  if (!userToken) {
    return reject('Token not found');
  }
  if (userToken.isTokenExpired) {
    return reject('Token is Expired');
  }

  if (user.userType) {
    let allowedPlatforms = LOGIN_ACCESS[user.userType] || [];
    if (!allowedPlatforms.includes(platform)) {
      return reject('Unauthorized user');
    }
  }

  resolve();
};

const auth = (platform) => async (req, res, next) => {
  console.log(`Authenticating for platform: ${platform}`);

  let strategy = platform === PLATFORM.USERAPP ? 'userapp-rule' : platform === PLATFORM.ADMIN ? 'admin-rule' : null;
  if (!strategy) {
    return res.unAuthorized({ message: 'Invalid platform' });
  }

  return new Promise((resolve, reject) => {
    passport.authenticate(strategy, { session: false }, verifyCallback(req, resolve, reject, platform))(
      req,
      res,
      next
    );
  })
    .then(() => next())
    .catch((error) => {
      console.error("Auth Error:", error);
      return res.unAuthorized({ message: error });
    });
};

module.exports = auth;
