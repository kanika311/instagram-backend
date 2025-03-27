// models/commentReply.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');

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

const commentReplySchema = new Schema({
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'comment',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

commentReplySchema.plugin(mongoosePaginate);
commentReplySchema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });

module.exports = mongoose.model('commentReply', commentReplySchema);