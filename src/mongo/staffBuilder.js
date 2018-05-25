
const schema = {
	staffId: {
		required: true,
		type: Number
	},
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
		type: String,
		required: true
	},
	status: {
		type: [{
			type: String,
		}],
		required: true,
	}
};



module.exports.schema = mongoose => {
	return new mongoose.Schema(schema, {id: false, autoIndex: false});
};

module.exports.collectionName = 'staff';