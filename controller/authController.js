
const User = require('../model/user')
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../firebase/auth');
const authService = require('../services/auth');
const authConstant = require('../constants/authConstant');
const dayjs = require('dayjs');



const register = async(req,res)=>{
    try {
        let {phone,email,username} = req.body;
        if((!email && !phone) || !username){
            return res.badRequest({message : "Insufficient request parameters! email (or phone) and username are required"})
        }
        const data = new User({
            ...req.body,
            userType: authConstant.USER_TYPES.User
        })

        if(req.body.email){
            let found = await User.findOne({email:email});
            if(found){
                return res.validationError({message : `${email} already exists.Unique email are allowed.`})
            }
        }
        if(req.body.phone){
            let found = await User.findOne({phone:phone});
            if(found){
                return res.validationError({message : `${phone} already exists.Unique phone are allowed.`})
            }
        }
        if(req.body.username){
            if (!/^[a-zA-Z0-9_]+$/.test(req.body.username)) {
                return res.validationError({ message: "username must contain only alphanumeric characters and underscores" });
            }
            let found = await User.findOne({username:username});
            if(found){
                return res.validationError({message : `${username} already exists.Unique username are allowed.`})
            }
        }

        const result = await User.create(data);

        return res.success({data:result})
    } catch (error) {
        return res.internalServerError({data:error.message})
    }
}

const login = async(req,res)=>{
    try {
        let {username,password} = req.body;

        if(!username){
            return res.badRequest({message : "Insufficient request parameters! email or phone is required"})
        }
        if(!password){
            return res.badRequest({message : "Insufficient request parameters! password is required"})
        }

        // let check;

        // if(Number(username)){
        //     check = {phone:username}
        // }
        // else{
        //     check = {email:username}
        // }
        let result = await authService.loginUser(username, password, authConstant.PLATFORM.USERAPP);
      if (result.flag) {
        return res.badRequest({ message: result.data });
      }
        // let user = await User.findOne(check)

        // if(!user){
        //     return res.recordNotFound({message:"User doesn't exists"})
        // }

        // if(password){
        //     let checkPassword = user.isPasswordMatch(password);
        //     if(!checkPassword){
        //         return res.badRequest({message:"Incorrect Password"})
        //     }
        // }

        // let userData = user.toJSON();

        // let token =  jwt.sign({id:userData.id,email:userData.email},process.env.JWT_SCERET,{expiresIn:10000*60})

        // let result = {...userData,token}

        let expireTime = dayjs(result.data.token.expireTime);

// Get the current time
let now = dayjs();

// Calculate the difference in milliseconds
let differenceInMilliseconds = expireTime.diff(now);

        res.cookie('token',result.data.token.value, { httpOnly: false, secure: process.env.NODE_ENV === 'production', maxAge:  differenceInMilliseconds})
        res.json({ redirectUrl: process.env.FRONTEND_URL });
        
        // return res.success({
        //     data: result.data,
        //     message: 'Login Successful'
        //   });
    } catch (error) {
        return res.internalServerError({data:error.message})
    }
}

const googleLogin  = async(req,res)=>{
    try {
        const {credentials} = req.body;
        console.log(credentials);
        if(!credentials){
            return res.badRequest({message : "Insufficient credentials"})
        }
        const check = await verifyToken(credentials)

        let objVal = {
            name: check.name,
            email: check.email,
            picture: check.picture
        }
        let user = await User.findOne({email:check.email})
        if(!user){
            user = await User.create(objVal)
        }
        let userData = user.toJSON();

        let token =  jwt.sign({userId:userData.id,email:userData.email},process.env.JWT_SCERET,{expiresIn:10000*60})

        let result = {...userData,token}
        
        return res.success({data:result})
    } catch (error) {
        console.log(error);
    }
}

module.exports = {register,login,googleLogin};