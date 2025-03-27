// models/comment.model.js
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

const commentSchema = new Schema({
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


commentSchema.virtual('replies', {
    ref: 'commentReply',
    localField: '_id',
    foreignField: 'commentId',
    options: {
      sort: { createdAt: -1 },
      match: { isDeleted: false }
    }
  });


commentSchema.plugin(mongoosePaginate);
commentSchema.plugin(uniqueValidator, { message: 'Error, expected {VALUE} to be unique.' });
module.exports = mongoose.model('comment', commentSchema);