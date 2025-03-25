const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require("bcrypt");
const {USER_TYPES} = require("../constants/authConstant");
const {convertObjectToEnum} = require("../utils/common")

const myCustomLabels = {
    totalDocs: 'itemCount',
    docs: 'data',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    pagingCounter: 'slNo',
    meta: 'paginator',
  };
 
  mongoosePaginate.paginate.options = {customLabels:myCustomLabels}
  const Schema = mongoose.Schema;

  const schema = new Schema({
    username:{
      type: String,
      required: true,
    },
    password: {
        type: String,
      },
      name:{type:String},
      Gender:{type:String},
      Bio:{type:String},
      followers:[{ref: 'user',
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function(value) {
           const id = await mongoose.model('user').findById(value);
           return !!id;
        },
        message: 'user does not exist.'
     }}],
      following:[{ref: 'user',
      type: Schema.Types.ObjectId,
      validate: {
        validator: async function(value) {
           const id = await mongoose.model('user').findById(value);
           return !!id;
        },
        message: 'user does not exist.'
     }}],
     requestes:[{ref: 'user',
     type: Schema.Types.ObjectId,
     validate: {
       validator: async function(value) {
          const id = await mongoose.model('user').findById(value);
          return !!id;
       },
       message: 'user does not exist.'
    }}],
     blockedUser:[{ref: 'user',
     type: Schema.Types.ObjectId,
     validate: {
       validator: async function(value) {
          const id = await mongoose.model('user').findById(value);
          return !!id;
       },
       message: 'user does not exist.'
    }}],
    isPrivate:{
        type: Boolean,
        default: false
    },
      email: {
        type: String,
      },
      phone: {
          type: Number,
        },
       country_code:{
        type: Number,
        default:91
       } ,
       address:[{
          locality : {type:String},
          city : {type:String},
          state : {type:String},
          country : {type:String},
          zipcode : {type:Number}
       }],
       registeredLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number]
        }
      },
      userType: {
        type: Number,
        enum: convertObjectToEnum(USER_TYPES),
        required: true
      },
      languagePreference: {
        type: String,
        default: "en"
      },
      picture: {
        type: String
      },

      resetPasswordLink: {
        code: String,
        expireTime: Date
      },
      token: {
        value: String,
        expireTime: Date
      },
        loginRetryLimit: {
          type: Number,
          default: 0
        },
        loginReactiveTime: { type: Date },
        loginOTP: {
          code: String,
          expireTime: Date
        },
        ssoAuth: { googleId: { type: String } },
        idproof: { type: String },
      createdBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
      },
      updatedBy: {
        ref: 'user',
        type: Schema.Types.ObjectId
      },
      isAppUser: { type: Boolean, default: true },
      isActive: { type: Boolean },
      isDeleted: { type: Boolean},
      createdAt: { type: Date },
      updatedAt: { type: Date },
   
  
    },
      {
        timestamps: {
          createdAt: 'createdAt',
          updatedAt: 'updatedAt'
        }
      }

  );

  schema.pre('save', async function (next) {
    this.isDeleted = false;
    this.isActive = true;
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  });

  schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length) {
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
        element.isActive = true;
      }
    }
    next();
  });

  schema.methods.isPasswordMatch = async function (password) {
    const user = this;
    return bcrypt.compare(password, user.password);
  };

  schema.method('toJSON', function () {
    const {
      _id, __v, ...object
    } = this.toObject({ virtuals: true });
    object.id = _id;
    delete object.password;
    return object;
  });

schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });
const user = mongoose.model('user', schema);

module.exports = user;