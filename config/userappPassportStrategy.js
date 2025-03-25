/**
 * @description : exports authentication strategy for userapp using passport.js
 * @params {Object} passport : passport object for authentication
 * @return {callback} : returns callback to be used in middleware
 */
 
const {
    Strategy, ExtractJwt, 
  } = require('passport-jwt');
  const User = require('../model/user');
  
  const userappPassportStrategy = (passport) => {
    const options = {};
    options.jwtFromRequest = (req) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.token;  // Assumes the JWT is stored under 'token' in the cookies
      }
      return token;
    };
    options.secretOrKey = process.env.JWT_SCERET;
    passport.use('userapp-rule',
      new Strategy(options, async (payload, done) => {
        try {
          const result = await User.findOne({ _id: payload.id || payload.userId });
          if (result) {
            return done(null, result.toJSON());
          }
          return done('No User Found', {});
        } catch (error) {
            console.log("error in config userappPasswordStratagey",error);
          return done(error,{});
        }
      })
    );   
  };
  
  module.exports = { userappPassportStrategy };