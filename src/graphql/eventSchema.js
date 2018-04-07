const { TypeComposer } = require('graphql-compose');
const neo4jApi = require('../neo4j_api');
const cassandraApi = require('../cassandra_api');
const { Types } = require('mongoose');

const eventTC =  TypeComposer.create(`
	type Event {
		ID: String!
		date: Date!
		description: String
	}
`);

const eventCreateInput = `
	input eventCreate {
		date: Date!,
		description: String
		humanId: String
	}
`;

eventTC.addFields({
	consequences: {
		type: ['Event'],
		args: {
			limit: "Int"
		},
		resolve: async (source, args) => {
			let records = await neo4jApi.getLink(source.ID, args.limit);
			return records.map(item => {
				item = item.get('event').properties
				item.date = new Date(item.date);
				return item;
			});
		}
	}
});


eventTC.addResolver({
	kind: 'mutation',
	name: 'add',
	args: {
		event: eventCreateInput
	},
	type: eventTC,
	resolve: async ({args}) => {
		let id = Types.ObjectId().toString();
		let descr = args.event.description || "";
		let humanId = args.event.humanId || null;
		return await neo4jApi.addEvent(id, args.event.date.toString(), descr, humanId);
	}
});

eventTC.addResolver({
	kind: 'mutation',
	name: 'linkReason',
	args: {
		id: 'String!',
		reasonId: 'String!'
	},
	type: 'String',
	resolve: async ({args}) => {
		await neo4jApi.linkEvents(args.id, args.reasonId);
		return "Success"
	}
});


eventTC.addResolver({
	kind: 'query',
	name: 'findById',
	args: {
		id: 'String!'
	},
	type: eventTC,
	resolve: async ({args}) => {
		let result = await neo4jApi.getEvent(args.id);
		result.date = new Date(result.date);
		return result;
	}
});

eventTC.addResolver({
	kind: 'query',
	name: 'getAll',
	type: [eventTC],
	args: {
		limit: "Int",
		offset: "Int"
	},
	resolve: async ({args}) => {
		let limit = args.limit || 25, offset = args.offset || 0;
		let result = await neo4jApi.getAllEvents(limit, offset);
		return result.map(item => {
			item = item.get(0).properties;
			item.date = new Date(item.date);
			return item;
		});
	}
});


module.exports = eventTC;