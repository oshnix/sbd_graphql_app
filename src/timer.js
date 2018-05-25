const { model } = require('./mongo/index');
const pg = require('./postgres');

let staffReadCount = {};
let callCount = 0;

module.exports = {
	getCoeficient(staffReadData) {
		return staffReadData.readCount * 2 / staffReadData.timeSpent;
	},
	addStaffRead(id, inMongo = false){
		staffReadCount[id] = {
			readCount: 1,
			timeSpent: 0,
			inMongo
		};
	},
	async increaseStaffReadCount(id) {
		staffReadCount[id].readCount++;
		if (!staffReadCount[id].inMongo && this.getCoeficient(staffReadCount[id]) > 4) {
			let result = await pg.findByID(id);
			pg.delete(id);
			staffReadCount[id].inMongo = true;
			let staff = new model(result);
			await staff.save();
		}
	},
	getStaffInMongo(id){
		return staffReadCount[id] ? staffReadCount[id].inMongo : false;
	},
	checkIds(){
		callCount++;
		let wasDeleted = false;
		for (let itemKey in this.staffReadCount) {
			let item = staffReadCount[itemKey];
			item.timeSpent++;
			if(this.getCoeficient(item) < 0.5) {
				delete staffReadCount[itemKey];
				wasDeleted = true;
			}
		}
		if (wasDeleted || callCount < 2) {
			model.find().then(response => {
				response.filter(item => !staffReadCount.hasOwnProperty(item.staffId));
				response.forEach(item => {
					pg.insert(item);
					item.remove();
				})
			})
		}
	}
};

