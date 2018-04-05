const statusEnum = require('./staffStatuses');

const collectionName = 'staff';

const schema = {
	firstName: {
		required: true,
		type: String
	},
	lastName: {
		required: true,
		type: String
	},
	nickname: String,
	birthDate: {
		required: true,
		type: Date
	},
	isActive : {
		required: true,
		type: Boolean
	},
	salary: {
		type: Number,
		min: 10,
		max: 1000,
		required: true
	},
	description: {
		type: String,
	},
	position: {
		type: String
	},
	parentPosition: {
		type: String
	},
	status: {
		type: [{
			type: String,
			enum: statusEnum
		}],
		required: true,
		validate: val => val.length >= 1 && val.length <= 3
	}
};



module.exports = mongoose => {
	let staff = new mongoose.Schema(schema);
	staff.index({firstName: 1, lastName: 1, nickname: 1}, {unique: true});

	return mongoose.model(collectionName, staff, collectionName);
};

