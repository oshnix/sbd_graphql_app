const cassandraApi = require('./src/cassandra/cassandra_api');



cassandraApi.init();
var prms = new Object();
prms.staffId=1;
prms.firstName="M";
prms.lastName="A";
prms.nickname='good';
prms.birthDate='1996-12-13';
prms.position="Director";
prms.bossId=null;
prms.isActive=true;
prms.salary=123;
prms.description="no";
prms.status=["good guy","really good!"];
console.log(cassandraApi.update(1,prms));
/*
let res=cassandraApi.update(1,prms).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
})
*/
/*
require('dotenv').config();
const postgres = require('./src/postgres');
const timer = require('./src/timer');

const app = require('express')();
const schemaComposer = require('graphql-compose').schemaComposer;
const graphqlHTTP = require('express-graphql');

const cassandraApi = require('./src/cassandra_api');
const neo4jApi = require('./src/neo4j_api');

const mongoDriver = require('./src/mongo');
const staffSchema = require('./src/graphql/staffSchema');
Promise.all([
	postgres.init(),
	mongoDriver.init(),
	cassandraApi.init(),
	neo4jApi.init()
]).then(() => {
	schemaComposer.rootQuery().addFields({
		findStaffById: staffSchema.getResolver('findById'),
		find: staffSchema.getResolver('find'),
	});

	schemaComposer.rootMutation().addFields({
		addStaff: staffSchema.getResolver('add'),
		updateStaff: staffSchema.getResolver('update'),
		deleteStaff: staffSchema.getResolver('delete')
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
	setInterval(timer.checkIds, 30000);
}).catch(error => {
	console.error(error);
});
*/