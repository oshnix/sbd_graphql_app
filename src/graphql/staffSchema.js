const { TypeComposer } = require('graphql-compose');
const { model } = require('../mongo/index');
const neo4jApi = require('../neo4j_api');

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

const staffFilterInput =
	`input staffFilterInput	 {
		_id: String
		firstName: String
		lastName: String
	}`;

const multipleStaffFilterInput =
	`input multipleStaffFilterInput	 {
		_ids: [String]
		firstName: String
		lastName: String
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
	kind: 'query',
	name: 'findMany',
	args: {
		filter: multipleStaffFilterInput
	},
	type: [staffTC],
	resolve: async ({args}) => {
		return await fetchStaff(model.find(args.filter));
	}
});

async function fetchStaff(promise){
	let staff = await promise;
	let neoRes = await neo4jApi.getHumanBoss(staff._id.toString(), 1);
	staff.bossId = neoRes[0] ? neoRes[0].get(0).properties['ID'] : null;
	return staff;
}

async function fetchSlaves(item, limit = 10){
	let neoRes = await neo4jApi.getBossSlaves(item._id.toString(), limit);
	let ids = neoRes.map(item => item.get(0).properties['ID']);
	return await model.find({_id: {$in: ids}});
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
	}
});

module.exports = staffTC;