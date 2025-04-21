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
		question: {
			type: String,
            answer: [{
                type: String,
            }],	
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



schema.method("toJSON", function () {
    const { _id, __v, ...object } = this.toObject({ virtuals: true });
    object.id = _id;
    return object;
});

schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator, {
    message: "Error, expected {VALUE} to be unique.",
});


schema.plugin(mongoosePaginate);
const qanda = mongoose.model("qanda", schema);

module.exports = qanda;
