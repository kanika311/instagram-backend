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
    users:[{
        ref: 'user',
        type: Schema.Types.ObjectId
    }],
    messages:[{
      ref: 'message',
      type: Schema.Types.ObjectId
    }],
    admin:[{
      ref: 'user',
      type: Schema.Types.ObjectId
  }],
  picture:{
    type: String,
  },
  description:{
    type: String,
  },
  groupName: {
    type: String,
    required: function() {
      return this.isGroup; // groupName is required if isGroup is true
    }
  },
  createBy:{
    ref: 'user',
    type: Schema.Types.ObjectId
  },
      isGroup: { type: Boolean , default: false},
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
    next();
  });

  schema.pre('remove', async function(next) {
    await this.model('message').deleteMany({ chat: this._id });
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
const chat = mongoose.model('chat', schema);

module.exports = chat;