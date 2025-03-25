const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
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
      type: Schema.Types.ObjectId
    } ,
    chatId: {
      ref: 'chat',
      type: Schema.Types.ObjectId
    } ,
    seenBy:[{
      ref: 'user',
      type: Schema.Types.ObjectId
    }],
    message: String,
    attachments: [{
      fieldname: String,
      originalname: String,
      encoding: String,
      mimetype: String,
      destination: String,
      filename: String,
      path: String,
      size: Number
    }],
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isDeleted: { type: Boolean},
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
const message = mongoose.model('message', schema);

module.exports = message;