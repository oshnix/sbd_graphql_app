const { TypeComposer } = require('graphql-compose');
const { model } = require('../mongo/index');
const pg = require('../postgres');
const neo4jApi = require('../neo4j_api');
const cassandraApi = require('../cassandra/cassandra_api');
const timer = require('../timer');


const minLevel = 1;

const staffTC =  TypeComposer.create(`
	type Staff {
		firstName: String!
		lastName: String!
		staffId: Int!
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
		bossId: Int
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
		bossId: Int
		newBossId: Int
		description: String
		nickname: String
	}`;


const staffFilterInput =
	`input staffFilterInput	 {
		firstName: String
		staffId: Int
		lastName: String
		isActive: Boolean
		status: [String]
		description: String
		nickname: String
		position: String
		bossId: Int
	}`;

function checkLevel(level){
	if (typeof level !== 'undefined' && level <= 0 || level > 4) {
		throw new Error('Level should be between 1 and 4');
	}
}

async function find (filter, level = 0){
	let result;
	switch (level) {
		case 0:
		case 1:
			result = await neo4jApi.find(filter);
			if ((result && result.length) || level === 1) {
				return result;
			}
		case 2:
			result = await cassandraApi.find(filter);
			if ((result && result.length) || level === 2) {
				return result;
			}
		case 3:
			result = await model.find(filter);
			if ((result && result.length) || level === 3) {
				if (result && result.length) result.forEach(item => {
					timer.increaseStaffReadCount(item.staffId, true);
				});
				return result;
			}
		case 4:
			result = await pg.find(filter);
			if (result && result.length ) {
				result.forEach(item => {
					timer.increaseStaffReadCount(item.staffId, false);
				});
			}
			return result;
	}
}

async function findOneById(id, level = 0) {
	let result;
	switch (level) {
		case 0:
		case 1:
			result = await neo4jApi.findById(id);
			if (result || level === 1) {
				return result;
			}
		case 2:
			result = await cassandraApi.findById(id);
			if (result || level === 2) {
				return result;
			}
		case 3:
			result = await model.findOne({staffId: id});
			if ((result) || level === 3) {
				if (result) timer.increaseStaffReadCount(result.staffId, true);
				return result;
			}
		case 4:
			result = await pg.findByID(id);
			if (result) {
				timer.increaseStaffReadCount(result.staffId, false);
			}
			return result;
	}
}

async function add(params, level = minLevel) {
	let staff;
	switch (level) {
		case 1:
			staff = await neo4jApi.insert(params);
			return staff;
		case 2:
			staff = await cassandraApi.insert(params);
			return staff;
		case 3:
			staff = new model(params);
			await staff.save();
			return staff;
		case 4:
			return await pg.insert(params);
	}
}


staffTC.addResolver({
	kind: 'query',
	name: 'find',
	args: {
		filter: staffFilterInput,
		level: 'Int'
	},
	type: [staffTC],
	resolve: async ({args}) => {
		checkLevel(args.level);
		return await find(args.filter, args.level);
	}
});

staffTC.addResolver({
	kind: 'query',
	name: 'findById',
	args: {
		staffId: 'Int!',
		level: 'Int'
	},
	type: staffTC,
	resolve: async ({args}) => {
		checkLevel(args.level);
		return await findOneById(args.staffId, args.level);
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
		return await add(args.person);
	}
});

staffTC.addResolver({
	kind: "mutation",
	name: 'delete',
	args: {
		staffId: "Int!",
		newBossId: "Int"
	},
	type: "String",
	resolve: async ({args}) => {
		let id = args.staffId;
		await pg.delete(id);
		return "Success";
	}
});

staffTC.addResolver({
	kind: "mutation",
	name: 'update',
	args : {
		staffId: "Int!",
		personChanged: updateData
	},
	type: staffTC,
	resolve: async ({args}) => {
		let result = await pg.update(args.staffId, args.personChanged);
		return result;
	}
});

async function fetchStaff(promise){
	return await promise;
}


staffTC.addFields({
	boss: {
		type: "Staff",
		resolve: async (source) => {
			if(source.bossId){
				let result = await findOneById(source.bossId);
				return result;
			} else {
				return null;
			}
		},
		projection: { bossId: true }
	}
});

module.exports = staffTC;