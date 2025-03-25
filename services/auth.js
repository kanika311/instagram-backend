const { MAX_LOGIN_RETRY_LIMIT, PLATFORM, LOGIN_ACCESS, LOGIN_REACTIVE_TIME ,FORGOT_PASSWORD_WITH } = require("../constants/authConstant");
const User = require("../model/user")
const common = require("../utils/common");
const dayjs = require("dayjs");
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const dbService = require("../utils/dbServices");
const emailService = require("./email");
const bcrypt = require("bcrypt");




const loginUser = async (username, password, platform) => {
    try {
        let where;
        if (/^[a-zA-Z0-9_]+$/.test(username)) {
            where = {username: username };
        } else if (Number(username)) {
            where = {phone: username };
        } else {
            where = { email: username };
        } 
        where.isDeleted = false; 
        let user = await User.findOne(where);

        if (user) {
            if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT) {
                let now = dayjs();
                if (user.loginReactiveTime) {
                    let limitTime = dayjs(user.loginReactiveTime);
                    if (limitTime > now) {
                        let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
                        if (!(limitTime > expireTime)) {
                            return {
                                flag: true,
                                data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, limitTime)}.`
                            };
                        }
                        await User.findOneAndUpdate( { _id: user.id }, {
                            loginReactiveTime: expireTime.toISOString(),
                            loginRetryLimit: user.loginRetryLimit + 1
                        });
                        return {
                            flag: true,
                            data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`
                        };
                    } else {
                        user = await User.findOneAndUpdate( { _id: user.id }, {
                            loginReactiveTime: '',
                            loginRetryLimit: 0
                        }, { new: true });
                    }
                } else {
                    // send error
                    let expireTime = dayjs().add(LOGIN_REACTIVE_TIME, 'minute');
                    await User.findOneAndUpdate(
                        { _id: user.id, isDeleted: false },
                        {
                            loginReactiveTime: expireTime.toISOString(),
                            loginRetryLimit: user.loginRetryLimit + 1
                        });
                    return {
                        flag: true,
                        data: `you have exceed the number of limit.you can login after ${common.getDifferenceOfTwoDatesInTime(now, expireTime)}.`
                    };
                }
            }
        if (password) {
                const isPasswordMatched = await user.isPasswordMatch(password);
                if (!isPasswordMatched) {
                    await User.findOneAndUpdate(
                        { _id: user.id, isActive: true, isDeleted: false },
                        { loginRetryLimit: user.loginRetryLimit + 1 });
                    return { flag: true, data: 'Invalid credential' }
                }
            }
            const userData = user.toJSON()
            if (!user.userType) {
                return { flag: true, data: 'You have not been assigned any role' }
            }
            if (platform == PLATFORM.USERAPP) {
                if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.USERAPP)) {
                    return { flag: true, data: 'you are unable to access this platform' }
                }
                // token = await generateToken(userData, JWT.USERAPP_SECRET)
            }
            else if (platform == PLATFORM.ADMIN) {
                if (!LOGIN_ACCESS[user.userType].includes(PLATFORM.ADMIN)) {
                    return { flag: true, data: 'you are unable to access this platform' }
                }
                // token = await generateToken(userData, JWT.ADMIN_SECRET)
            }
          
            let token =  jwt.sign({id:userData.id,email:userData.email},process.env.JWT_SCERET,{expiresIn:10000*60})
            let expire = dayjs().add(10000*60, 'second').toISOString();
            let  updateUser = await User.findOneAndUpdate({ _id: user.id, isDeleted: false },{token:{value:token,expireTime:expire}},{returnNewDocument: true})
            console.log("expire Time Token",expire);
            // updateUser = updateUser.toJSON();
            let userToReturn = { ...userData, token:{value:token,expireTime:expire} };
            return { flag: false, data: userToReturn }

        } else {
            return { flag: true, data: 'User not exists' }
        }
    } catch (error) {
        throw new Error(error.message)
    }
};

const sendResetPasswordOtpNotification = async (user) => {
    let resultOfEmail = false;
    try {
        let where = {
            _id: user.id,
            isActive: true, isDeleted: false,
        }
       // let token = uuid();
        let token = otpGenerator.generate(6, { digits:true,lowerCaseAlphabets:false ,upperCaseAlphabets: false, specialChars: false });
        console.log(token)
        let expires = dayjs();
        expires = expires.add(FORGOT_PASSWORD_WITH.EXPIRE_TIME, "minute").toISOString();
        await dbService.updateOne(User, where,
            { resetPasswordLink: { code: token, expireTime: expires } });
        if (user.email) {
            let viewType = "/reset-password/";
        
            let mailObj = {
                subject: "Nsfashion Reset Password OTP",
                to: user.email,
                template: "/views/email/OTP/resetPasswordOtp",
                data: {
                    isWidth: true,
                    user: user || '-',
                    token:token
                }
            };
            try {
                await emailService.sendMail(mailObj);
                resultOfEmail = true;
            } catch (error) {
                console.log(error);
            }
        }
      
        return { resultOfEmail };
    } catch (error) {
        throw new Error(error.message);
    }
};


/**
 * @description : send otp notification for register.
 * @param {Object} user : user document
 * @return {}  : returns status where notification is sent or not
 */



/**
 * @description : reset password.
 * @param {Object} user : user document
 * @param {string} newPassword : new password to be set.
 * @return {}  : returns status whether new password is set or not. {flag, data}
 */
const resetPassword = async (user, newPassword) => {
    try {
        console.log(user,'hello password')
        let where = {
            _id: user.id,
            isActive: true, isDeleted: false,
        }
        const dbUser = await dbService.findOne(User, where);
        if (!dbUser) {
            return {
                flag: true,
                data: "User not found",
            };
        }
        newPassword = await bcrypt.hash(newPassword, 8);
        await dbService.updateOne(User, where, {
            "password": newPassword,
            resetPasswordLink: {},
            loginRetryLimit: 0
        });

        console.log('hello reset password')
     
        return {
            flag: false,
            data: "Password reset successfully",
        };
    } catch (error) {
        throw new Error(error.message)
    }
};

module.exports = {loginUser ,sendResetPasswordOtpNotification , resetPassword}