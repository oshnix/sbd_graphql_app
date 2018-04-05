const buildModel = require('./staffBuilder');

let model = null;

module.exports = {
	init(mongoose){
		model = buildModel(mongoose);
	},
	find(){
		model.find().then(response => {
			console.log(response);
		})
	},
	newStaff(params){
		let staff = new model(params);
		return staff.save()
	}
};

