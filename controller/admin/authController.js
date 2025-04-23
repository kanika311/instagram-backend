const User = require("../../model/user");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../../firebase/auth");
const authService = require("../../services/auth");
const authConstant = require("../../constants/authConstant");
const userSchemaKey = require("../../utils/validation/userValidation");
const validation = require("../../utils/validateRequest");
const dbService = require("../../utils/dbServices");
const dayjs = require("dayjs");

const register = async (req,res) =>{
    try {
      let {
        email,phone, password
      } = req.body;
     
      if (!email && !phone) {
        return res.badRequest({ message: 'Insufficient request parameters! email or phone  is required.' });
      }
      if (!password) {
        return res.badRequest({ message: 'Insufficient request parameters! password is required.' });
      }

      // validation  
      let validateRequest = validation.validateParamsWithJoi(
        req.body,
        userSchemaKey.schemaKeys
      );
      if (!validateRequest.isValid) {
        return res.validationError({ message :  `Invalid values in parameters, ${validateRequest.message}` });
      } 
     
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
     
      const data = new User({
        ...req.body,
        userType: authConstant.USER_TYPES.Admin
      });
     
      // check data availble in database or not
    
      if(req.body.email){
        let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['email'],data,'REGISTER');
        if (checkUniqueFields.isDuplicate){
          return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
        }
    }
    if(req.body.phone){
        let checkUniqueFields = await common.checkUniqueFieldsInDatabase(User,['phone'],data,'REGISTER');
      if (checkUniqueFields.isDuplicate){
        return res.validationError({ message : `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.` });
      }
    }
    // create user
      const result = await dbService.create(User,data);

      return res.success({ data :result });
    } catch (error) {
      return res.internalServerError({ data:error.message });
    }  
  };

const login = async (req, res) => {
	try {
		let { email, username, password, phone } = req.body;

		if (!(email || phone)) {
			return res.badRequest({
				message: "Insufficient request parameters! username  is required.",
			});
		}
		if (!password) {
			return res.badRequest({
				message: "Insufficient request parameters! password is required.",
			});
		}

		let roleAccess = false;
		let result = await authService.loginUser(
			email,
			username,
			password,
			authConstant.PLATFORM.USERAPP,
			roleAccess
		);
		if (result.flag) {
			return res.badRequest({ message: result.data });
		}
		return res.success({
			data: result.data,
			message: "Login Successful",
		});
	} catch (error) {
		return res.internalServerError({ data: error.message });
	}
};

const googleLogin = async (req, res) => {
	try {
		const { credentials } = req.body;
		console.log(credentials);
		if (!credentials) {
			return res.badRequest({ message: "Insufficient credentials" });
		}
		const check = await verifyToken(credentials);

		let objVal = {
			name: check.name,
			email: check.email,
			picture: check.picture,
		};
		let user = await User.findOne({ email: check.email });
		if (!user) {
			user = await User.create(objVal);
		}
		let userData = user.toJSON();

		let token = jwt.sign(
			{ userId: userData.id, email: userData.email },
			process.env.JWT_SCERET,
			{ expiresIn: 10000 * 60 }
		);

		let result = { ...userData, token };

		return res.success({ data: result });
	} catch (error) {
		console.log(error);
	}
};

const sentResetPasswordOtp = async (req, res) => {
	const params = req.body;
	try {
		if (!params.email && !params.phone) {
			return res.badRequest({
				message: "Insufficient request parameters! email or phone is required.",
			});
		}
		let where;
		if (params.email) {
			where = { email: params.email };
			where.isActive = true;
			where.isDeleted = false;
			params.email = params.email.toString().toLowerCase();
		}
		if (params.phone) {
			where = { phone: params.phone };
			where.isActive = true;
			where.isDeleted = false;
		}

		let found = await dbService.findOne(User, where);
		if (!found) {
			return res.recordNotFound();
		}
		let { resultOfEmail, resultOfSMS } =
			await authService.sendResetPasswordOtpNotification(found);
		if (resultOfEmail && resultOfSMS) {
			return res.success({ message: "otp successfully send." });
		} else if (resultOfEmail && !resultOfSMS) {
			return res.success({ message: "otp successfully send to your email." });
		} else if (!resultOfEmail && resultOfSMS) {
			return res.success({
				message: "otp successfully send to your mobile number.",
			});
		} else {
			return res.failure({
				message: "otp can not be sent due to some issue try again later",
			});
		}
	} catch (error) {
		return res.internalServerError({ data: error.message });
	}
};

const resetPassword = async (req, res) => {
	const params = req.body;
	console.log(req.body.code);
	try {
		if (!params.code || !params.newPassword) {
			return res.badRequest({
				message:
					"Insufficient request parameters! code and newPassword is required.",
			});
		}
		const where = {
			"resetPasswordLink.code": params.code,
			isActive: true,
			isDeleted: false,
		};
		let found = await dbService.findOne(User, where);
		console.log(found, "hello");
		if (!found || !found.resetPasswordLink.expireTime) {
			return res.failure({ message: "Invalid Code" });
		}
		if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
			return res.failure({
				message: "Your reset password link is expired or invalid",
			});
		}
		let response = await authService.resetPassword(found, params.newPassword);
		if (!response || response.flag) {
			return res.failure({ message: response.data });
		}
		return res.success({ message: response.data });
	} catch (error) {
		return res.internalServerError({ data: error.message });
	}
};

const validateOtp = async (req, res) => {
	const params = req.body;
	try {
		if (!params.otp) {
			return res.badRequest({
				message: "Insufficient request parameters! otp is required.",
			});
		}
		const where = {
			"resetPasswordLink.code": params.otp,
			isActive: true,
			isDeleted: false,
		};
		let found = await dbService.findOne(User, where);
		if (!found || !found.resetPasswordLink.expireTime) {
			return res.failure({ message: "Invalid OTP" });
		}
		if (dayjs(new Date()).isAfter(dayjs(found.resetPasswordLink.expireTime))) {
			return res.failure({
				message: "Your reset password link is expired or invalid",
			});
		}
		let a = await dbService.updateOne(
			User,
			{ _id: found.id },
			{ resetPasswordLink: {} }
		);
		console.log(a);
		return res.success({ message: "OTP verified" });
	} catch (error) {
		return res.internalServerError({ data: error.message });
	}
};

module.exports = {
	register,
	login,
	googleLogin,
	sentResetPasswordOtp,
	resetPassword,
	validateOtp,
};
