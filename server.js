const mongoose = require("mongoose");
const app = require('express')();
const graphqlHTTP = require('express-graphql');
const cassandraApi = require('./src/cassandra_api');
const neo4jApi = require('./src/neo4j_api');
const mongoOperations = require('./src/mongo/staffOperations');

require('dotenv').config();
