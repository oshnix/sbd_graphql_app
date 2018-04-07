const { TypeComposer } = require('graphql-compose');
const { model } = require('../mongo/index');
const neo4jApi = require('../neo4j_api');
const cassandraApi = require('../cassandra_api');
const eventSchema = require('./eventSchema');

const staffTC =  TypeComposer.create(`
	type Staff {
		firstName: String!
		lastName: String!
		_id: String!
		birthDate: Date!
		isActive: Boolean!
		salary: Int!
		status: [String]!
		description: String
		nickname: String
		position: String!
		bossId: String
	}
`);

const creationData =
	`input staffCreationData {
		firstName: String!
		lastName: String!
		status: [String]!
		salary: Int!
		birthDate: Date!
		position: String!
		bossId: String
		description: String
		nickname: String
	}`;

const updateData =
	`input staffUpdateData {
		firstName: String
		lastName: String
		status: [String]
		isActive: Boolean
		salary: Int
		position: String
		bossId: String
		slavesNewBossId: String
		description: String
		nickname: String
	}`;


const staffFilterInput =
	`input staffFilterInput	 {
		firstName: String
		lastName: String
		isActive: Boolean
		status: [String]
		description: String
		nickname: String
		position: String
		bossId: String
	}`;

staffTC.addResolver({
	kind: 'query',
	name: 'findOne',
	args: {
		filter: staffFilterInput
	},
	type: staffTC,
	resolve: async ({args}) => {
		return await fetchStaff(model.findOne(args.filter));
	}
});

staffTC.addResolver({
	kind: 'query',
	name: 'findById',
	args: {
		_id: 'String'
	},
	type: staffTC,
	resolve: async ({args}) => {
		return await fetchStaff(model.findById(args._id));
	}
});

staffTC.addResolver({
	kind: "mutation",
	name: 'add',
	args : {
		person: creationData
	},
	type: staffTC,
	resolve: async ({args}) => {
		args.person.isActive = true;
		let staff = new model(args.person);
		await staff.save();
		let id = staff._id.toString();
		let bossId = args.person.bossId;
		await neo4jApi.addHuman(id, bossId);
		await cassandraApi.insertPerson(id, bossId, staff.firstName, staff.lastName, staff.nickname, staff.position, staff.salary, staff.status[0]);
		return staff;
	}
});

staffTC.addResolver({
	kind: "mutation",
	name: 'delete',
	args: {
		_id: "String!",
		newBossId: "String!"
	},
	type: "String",
	resolve: async ({args}) => {
		let id = args._id;
		let bossId = args.bossId;

		await neo4jApi.changeSlavesBoss(id, bossId);
		await neo4jApi.deleteHuman(id);
		await model.remove({_id: id});
		await cassandraApi.removePerson(id);
		return "Success";
	}
});

staffTC.addResolver({
	kind: "mutation",
	name: 'update',
	args : {
		_id: "String!",
		personChanged: updateData
	},
	type: staffTC,
	resolve: async ({args}) => {
		let id = args._id.toString();
		let staff = await model.findById(id);
		if (args.personChanged.bossId) {
			await neo4jApi.changePersonBoss(id, args.personChanged.bossId);
		}
		if (args.personChanged.isActive === false) {
			if (args.personChanged.slavesNewBossId) {
				await neo4jApi.changeSlavesBoss(id, args.personChanged.slavesNewBossId);
			} else {
				await neo4jApi.deleteAllBossConnections(id)
			}
		}

		for (let key in args.personChanged) {
			if (staff[key] !== undefined) {
				staff[key] = args.personChanged[key];
			}
		}
		await staff.save();

		await cassandraApi.insertPerson(id, args.personChanged.bossId, staff.firstName, staff.lastName,
			staff.nickname, staff.position, staff.salary, staff.status[0]);
		return staff;
	}
});

function parseSlaveIds(neoRes) {
	return neoRes.map(item => item.get(0).properties['ID']);
}


async function fetchStaff(promise){
	let staff = await promise;
	staff.bossId = await getBossId(staff._id.toString());
	return staff;
}

async function getBossId(id){
	let neoRes = await neo4jApi.getHumanBoss(id, 1);
	return neoRes[0] ? neoRes[0].get(0).properties['ID'] : null;
}

async function fetchSlaves(item, limit = 10){
	let neoRes = await neo4jApi.getBossSlaves(item._id.toString(), limit);
	let slaves = await model.find({_id: {$in: parseSlaveIds(neoRes)}});
	return slaves.map(async item => {
		item.bossId = await getBossId(item._id.toString());
		return item;
	});
}

async function fetchLog(item, limit = 10){
	return await cassandraApi.selectTopNPersons(item._id.toString(), limit);
}


staffTC.addFields({
	boss: {
		type: "Staff",
		resolve: async (source) => fetchStaff(model.findById(source.bossId)),
		projection: { bossId: true }
	},
	slaves: {
		type: "[Staff]",
		args: {
			limit: "Int"
		},
		resolve: async (source, args) => {
			return fetchSlaves(source, args.limit);
		}
	},
	log: {
		type: [`type StaffLog {
			firstname: String!
			lastname: String!
			position: String!
			statuschange: String!
			salary: Int!
			timestamp: Date
			id: String!
			nickname: String!
		}`],
		args: {
			limit: "Int"
		},
		resolve: async (source, args) => {
			return fetchLog(source, args.limit);
		}
	},
	events: {
		type: [eventSchema],
		args: {
			limit: "Int"
		},
		resolve: async (source, args) => {
			let records = await neo4jApi.getPersonEvents(source._id.toString(), args.limit);
			return records.map(item => {
				item = item.get(0).properties;
				item.date = new Date(item.date);
				return item;
			});
		}
	}
});

module.exports = staffTC;