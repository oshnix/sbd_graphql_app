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


//TODO remove comments after copying useful stuff from it

/**
 * working functions:
 cassandraApi.insertPerson("0","boss","Test","Tester",null,"Director",100,"Active");

 ids=['1','2'];
 bosses=['boss1','boss2'];
 names=['Misha','Masha'];
 surnames=['sur1','sur2'];
 nicks=[null,null];
 pos=['Director','Manager'];
 sal=[100,500];
 stats=['Active','Dead'];
 let res=cassandraApi.insertPersons(ids,bosses,names,surnames,nicks,pos,sal,stats);

 removePerson('2');

 let res=cassandraApi.selectTopNPersons("2",1).then(result => {
         console.log(result);
     }).catch(error => {
         console.error(error);
     })

 let res=cassandraApi.selectPersonsByTimestamp("2",'2018-04-04 21:03:10','2018-04-04 21:03:20')
 */
/*

try{
    let res=cassandraApi.selectPersonsByField("0",'2017-04-04 21:54:10','2019-04-04 21:54:10','Dead','Manager').then(result => {
         console.log(result);
     }).catch(error => {
         console.error(error);
     })
}
catch (e) {
    console.log(e.stack);
}
console.log("After all");
let entry=[{
    name:'Myname'
},{
    name:'Myname'
}]*/
