let cassandraApi = require('./src/cassandra_api');
let neo4jApi = require('./src/neo4j_api');

let result = cassandraApi.returnHumanLogs();
console.log(result);


result = neo4jApi.returnHumanConnections();
console.log(result);
