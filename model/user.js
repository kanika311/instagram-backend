const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const bcrypt = require("bcrypt");
const { USER_TYPES } = require("../constants/authConstant");
const { convertObjectToEnum } = require("../utils/common");

const myCustomLabels = {
	totalDocs: "itemCount",
	docs: "data",
	limit: "perPage",
	page: "currentPage",
	nextPage: "next",
	prevPage: "prev",
	totalPages: "pageCount",
	pagingCounter: "slNo",
	meta: "paginator",
};

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
const Schema = mongoose.Schema;

const schema = new Schema(
	{
		password: {
			type: String,
		},
		username: {
			type: String,
		},
		name: { type: String },
		nickName: { type: String },
		email: {
			type: String,
		},
		dateofbirth: {
			type: String,
		},
		gender: { type: String },
		phone: {
			type: Number,
		},
		userType: {
			type: Number,
			enum: convertObjectToEnum(USER_TYPES),
			required: true,
		},
		country_code: {
			type: Number,
			default: 91,
		},
		picture: {
			type: String,
		},
		loginRetryLimit: {
			type: Number,
			default: 0,
		},
		followers: [
			{
				ref: "user",
				type: Schema.Types.ObjectId,
				index:true,
				validate: {
					validator: async function (value) {
						const id = await mongoose.model("user").findById(value);
						return !!id;
					},
					message: "user does not exist.",
				},
			},
		],
		following: [
			{
				ref: "user",
				type: Schema.Types.ObjectId,
				index:true,
				validate: {
					validator: async function (value) {
						const id = await mongoose.model("user").findById(value);
						return !!id;
					},
					message: "user does not exist.",
				},
			},
		],
		requestes: [
			{
				ref: "user",
				type: Schema.Types.ObjectId,
				index:true,
				validate: {
					validator: async function (value) {
						const id = await mongoose.model("user").findById(value);
						return !!id;
					},
					message: "user does not exist.",
				},
			},
		],
		blockedUser: [
			{
				ref: "user",
				type: Schema.Types.ObjectId,
				index:true,
				validate: {
					validator: async function (value) {
						const id = await mongoose.model("user").findById(value);
						return !!id;
					},
					message: "user does not exist.",
				},
			},
		],
		isPrivate: {
			type: Boolean,
			default: false,
		},
		loginReactiveTime: { type: Date },
		resetPasswordLink: {
			code: String,
			expireTime: Date,
		},
		loginRetryLimit: {
			type: Number,
			default: 0,
		},

		credit: {
			type: Number,
			default: 0,
		},
		createdBy: {
			ref: "user",
			type: Schema.Types.ObjectId,
			validate: {
				validator: async function (value) {
					const id = await mongoose.model("user").findById(value);
					return !!id;
				},
				message: "user does not exist.",
			},
		},
		updatedBy: {
			ref: "user",
			type: Schema.Types.ObjectId,
			validate: {
				validator: async function (value) {
					const id = await mongoose.model("user").findById(value);
					return !!id;
				},
				message: "user does not exist.",
			},
		},

		isAppUser: { type: Boolean, default: true },
		isDeleted: { type: Boolean },
		createdAt: { type: Date },
		updatedAt: { type: Date },
	},
	{
		timestamps: {
			createdAt: "createdAt",
			updatedAt: "updatedAt",
		},
	}
);

schema.pre("save", async function (next) {
	this.isDeleted = false;

	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	next();
});

schema.methods.isPasswordMatch = async function (password) {
	const user = this;
	return bcrypt.compare(password, user.password);
};

schema.method("toJSON", function () {
	const { _id, __v, ...object } = this.toObject({ virtuals: true });
	object.id = _id;
	delete object.password;
	return object;
});

schema.plugin(mongoosePaginate);
const user = mongoose.model("user", schema);

module.exports = user;
