/**
 * userTokens.js
 * @description :: model of a database collection userTokens
 */


const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
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
mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
const Schema = mongoose.Schema;
const schema = new Schema(
  {

    userId:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    token:{ type:String },

    tokenExpiredTime:{ type:Date },

    isTokenExpired:{
      type:Boolean,
      default:false
    },
    refreshToken:{
      type:String
    },
    refreshTokenExpiredTime:{
      type:Date
    },

    addedBy:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    updatedBy:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    createdAt:{ type:Date },

    updatedAt:{ type:Date },

    isDeleted:{ type:Boolean }
  }
  ,{ 
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
  if (docs && docs.length){
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
  } = this.toObject({ virtuals:true });
  object.id = _id;
     
  return object;
});
schema.plugin(mongoosePaginate);
const userTokens = mongoose.model('userTokens',schema);

module.exports = userTokens;