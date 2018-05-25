const { TypeComposer } = require('graphql-compose');
const { model } = require('../mongo/index');
const pg = require('../postgres');
const neo4jApi = require('../neo4j_api');
const cassandraApi = require('../cassandra_api');
const timer = require('../timer');

const minLevel = 3;

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
		case 2:
		case 3:
			result = await model.find(filter);
			if ((result && result.length) || level === 3) {
				if (result && result.length) result.forEach(item => {
					timer.increaseStaffReadCount(item.staffId, true);
				});
				return result;
			}
		case 4:
			result = await fetchStaff(pg.find(filter));
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
		case 2:
		case 3:
			result = await model.findOne({staffId: id});
			if ((result) || level === 3) {
				if (result) timer.increaseStaffReadCount(result.staffId, true);
				return result;
			}
		case 4:
			result = await fetchStaff(pg.findByID(id));
			if (result) {
				timer.increaseStaffReadCount(result.staffId, false);
			}
			return result;
	}
}

async function add(params, level = minLevel) {
	switch (level) {
		case 3:
			if (!params.staffId) params.staffId = 12;
			let staff = new model(params);
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
		/*let id = args._id.toString();
		let staff = await model.findById(id);
		if (args.personChanged.bossId) {
			if(args.personChanged.bossId === id) new Error("Cannot assign person as itself boss");
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
		return staff;*/
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
				return await fetchStaff(pg.findByID(source.bossId))
			} else {
				return null;
			}
		},
		projection: { bossId: true }
	}
});

module.exports = staffTC;