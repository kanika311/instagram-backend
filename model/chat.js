const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const idValidator = require('mongoose-id-validator');
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

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  users: [{
    ref: 'user',
    type: Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: async function(userId) {
        const user = await mongoose.model('user').findById(userId);
        return !!user;
      },
      message: 'User does not exist'
    }
  }],
  messages: [{
    ref: 'message',
    type: Schema.Types.ObjectId,
    validate: {
      validator: async function(messageId) {
        const message = await mongoose.model('message').findById(messageId);
        return !!message;
      },
      message: 'Message does not exist'
    }
  }],
  admin: [{
    ref: 'user',
    type: Schema.Types.ObjectId,
    validate: {
      validator: async function(userId) {
        if (!this.users.includes(userId)) {
          return false; // Admin must be a chat participant
        }
        const user = await mongoose.model('user').findById(userId);
        return !!user;
      },
      message: 'Admin must be a valid chat participant'
    }
  }],
  picture: {
    type: String,
    validate: {
      validator: function(url) {
        if (!url) return true;
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(url);
      },
      message: 'Invalid URL format for picture'
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  groupName: {
    type: String,
    required: function() {
      return this.isGroup;
    },
    maxlength: [100, 'Group name cannot exceed 100 characters'],
    trim: true
  },
  createdBy: {
    ref: 'user',
    type: Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: async function(userId) {
        const user = await mongoose.model('user').findById(userId);
        return !!user;
      },
      message: 'Creator user does not exist'
    }
  },
  isGroup: { 
    type: Boolean, 
    default: false,
    required: true
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  lastMessage: {
    ref: 'message',
    type: Schema.Types.ObjectId,
    validate: {
      validator: async function(messageId) {
        if (!messageId) return true;
        const message = await mongoose.model('message').findById(messageId);
        return !!message;
      },
      message: 'Last message does not exist'
    }
  },
  customPermissions: {
    type: Map,
    of: new Schema({
      canSendMessages: { type: Boolean, default: true },
      canAddParticipants: { type: Boolean, default: false },
      canRemoveParticipants: { type: Boolean, default: false },
      canChangeGroupInfo: { type: Boolean, default: false }
    }, { _id: false }),
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting unread message count per user
chatSchema.virtual('unreadCounts', {
  ref: 'message',
  localField: '_id',
  foreignField: 'chat',
  justOne: false,
  options: { 
    match: { 
      seenBy: { $ne: mongoose.Types.ObjectId(this.userId) } 
    } 
  }
});

// Indexes for better performance
chatSchema.index({ users: 1 });
chatSchema.index({ isGroup: 1 });
chatSchema.index({ 'lastMessage.createdAt': -1 });
chatSchema.index({ createdAt: -1 });

// Pre-save hooks
chatSchema.pre('save', async function(next) {
  if (this.isGroup && !this.groupName) {
    throw new Error('Group name is required for group chats');
  }
  
  // Ensure creator is always in users array
  if (!this.users.includes(this.createdBy)) {
    this.users.push(this.createdBy);
  }
  
  // Ensure creator is admin if it's a group
  if (this.isGroup && !this.admin.includes(this.createdBy)) {
    this.admin.push(this.createdBy);
  }
  
  next();
});

chatSchema.pre('remove', async function(next) {
  // Delete all associated messages
  await mongoose.model('message').deleteMany({ chatId: this._id });
  next();
});

// Custom validation for minimum participants in group chat
chatSchema.pre('validate', function(next) {
  if (this.isGroup && this.users.length < 2) {
    this.invalidate('users', 'Group chat must have at least 2 participants');
  }
  next();
});

// Plugin for ID validation
chatSchema.plugin(idValidator);
chatSchema.plugin(mongoosePaginate);
chatSchema.plugin(uniqueValidator, { 
  message: 'Error, expected {VALUE} to be unique.' 
});

const chat = mongoose.model('chat', chatSchema);

module.exports = chat;