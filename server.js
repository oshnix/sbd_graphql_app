require('dotenv').config();
const app = require('express')();
const schemaComposer = require('graphql-compose').schemaComposer;
const graphqlHTTP = require('express-graphql');

const cassandraApi = require('./src/cassandra_api');
const neo4jApi = require('./src/neo4j_api');

const mongoDriver = require('./src/mongo');
const staffSchema = require('./src/graphql/staffSchema');
const eventSchema = require('./src/graphql/eventSchema');

Promise.all([
	mongoDriver.init(),
	cassandraApi.init(),
	neo4jApi.init()
]).then(() => {
	schemaComposer.rootQuery().addFields({
		findStaffById: staffSchema.getResolver('findById'),
		findOneStaff: staffSchema.getResolver('findOne'),
		findEventById: eventSchema.getResolver('findById'),
		getAllEvents: eventSchema.getResolver('getAll')
	});

	schemaComposer.rootMutation().addFields({
		addStaff: staffSchema.getResolver('add'),
		updateStaff: staffSchema.getResolver('update'),
		deleteStaff: staffSchema.getResolver('delete'),
		addEvent: eventSchema.getResolver('add'),
		linkEvents: eventSchema.getResolver('linkReason')
	});

	const graphQlSchema = schemaComposer.buildSchema();


	app.use('/graphql', graphqlHTTP(req => ({
		schema: graphQlSchema,
		pretty: true,
		graphiql: true
	})));

	app.listen(4000, () => {
		console.log('Running a GraphQL API server at localhost:4000/graphql');
	});
}).catch(error => {
	console.error(error);
});
