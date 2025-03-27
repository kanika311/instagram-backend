// models/like.model.js
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

const likeSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'post',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  isLike: {
    type: Boolean,
    default: true
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

// Compound index to ensure one like per user per post
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

likeSchema.plugin(mongoosePaginate);
likeSchema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });

module.exports = mongoose.model('like', likeSchema);