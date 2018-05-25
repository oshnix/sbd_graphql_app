const { model } = require('./mongo/index');
const pg = require('./postgres');
const cassandra = require('./cassandra/cassandra_api');
const neo4j = require('./neo4j_api');

let staffReadCount = {};
let callCount = 0;

function getCoeficient(staffReadData) {
	return staffReadData.readCount * 2 / staffReadData.timeSpent;
}

module.exports = {
	async increaseStaffReadCount(id, inMongo = false) {
		if (!staffReadCount.hasOwnProperty(id)) {
			staffReadCount[id] = {
				readCount: 0,
				timeSpent: 1,
				inMongo
			}
		}
		staffReadCount[id].readCount++;
		console.log('Updated');
		console.log(staffReadCount[id]);
		if (!staffReadCount[id].inMongo && getCoeficient(staffReadCount[id]) > 4) {
			let result = await pg.findByID(id);
			await pg.delete(id);
			staffReadCount[id].inMongo = true;
			let staff = new model(result);
			await staff.save();
		}
	},
	getStaffInMongo(id) {
		return staffReadCount[id] ? staffReadCount[id].inMongo : false;
	},
	checkIds() {
		callCount++;
		let wasDeleted = false;
		for (let itemKey in staffReadCount) {
			let item = staffReadCount[itemKey];
			item.timeSpent++;
			if(getCoeficient(item) <= 0.5) {
				console.log("Deleted");
				console.log(staffReadCount[itemKey]);
				delete staffReadCount[itemKey];
				wasDeleted = true;
			}
		}
		if (wasDeleted || callCount < 2) {
			model.find().then( response => {
				let itemsToMove = response.filter(item => !staffReadCount.hasOwnProperty(item.staffId));
				itemsToMove.forEach(async item => {
					await model.remove({_id: item._id});
					await pg.insert(item._doc);
				})
			})
		}
	},
	async moveOldCassandraData() {
		let result = await cassandra.find({});
		let dataToMove = result.filter(item =>  (new Date().getTime() - item.creationDate.getTime()) / (1000 * 60) > 2);
		dataToMove.forEach(async item => {
			console.log('Moving data to mongo');
			await cassandra.delete(item.staffId);
			let staff = new model(item);
			await staff.save();
		});
	},
	async moveOldNeo4jData() {
		let result = await neo4j.find({});
		let dataToMove = result.filter(item =>  (new Date().getTime() - item.creationDate) / (1000 * 60) > 2);
		dataToMove.forEach(async item => {
			console.log('Moving data to cassandra');
			await neo4j.delete(item.staffId);
			await cassandra.insert(item);
		});
	}
};

