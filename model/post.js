const mongoose = require("mongoose");
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
    posts: [{
      pic: {type: String}
    }],
    description: {type: String},
    location: {type: String},
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
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

  schema.virtual('comments', {
    ref: 'comment',
    localField: '_id',
    foreignField: 'postId',
    options: { 
      sort: { createdAt: -1 },
      match: { isDeleted: false }
    }
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