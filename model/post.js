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
    userId: {
        ref: 'user',
        type: Schema.Types.ObjectId,
        validate: {
          validator: async function(value) {
             const id = await mongoose.model('user').findById(value);
             return !!id;
          },
          message: 'user does not exist.'
       },
      required: true
    },
    postValue: [{
      fieldname: String,
      originalname: String,
      encoding: String,
      mimetype: String,
      destination: String,
      filename: String,
      path: String,
      size: Number
    }],
    description: {type: String},
    like:[{
      ref: 'user',
        type: Schema.Types.ObjectId,
        validate: {
          validator: async function(value) {
             const id = await mongoose.model('user').findById(value);
             return !!id;
          },
          message: 'user does not exist.'
       }}],
    comment:[{
      user:{
        ref: 'user',
        type: Schema.Types.ObjectId,
        validate: {
          validator: async function(value) {
             const id = await mongoose.model('user').findById(value);
             return !!id;
          },
          message: 'user does not exist.'
       }
      },
      message: String,
      createdAt: { type: Date },
      updatedAt: { type: Date },
    }],

      isDeleted: { type: Boolean },
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
    next();
  });

  schema.pre('insertMany', async function (next, docs) {
    if (docs && docs.length) {
      for (let index = 0; index < docs.length; index++) {
        const element = docs[index];
        element.isDeleted = false;
      }
    }
    next();
  });

  schema.method('toJSON', function () {
    const {
      _id, __v, ...object
    } = this.toObject({ virtuals: true });
    object.id = _id;
    return object;
  });

schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });
const post = mongoose.model('post', schema);

module.exports = post;