const mongoose = require('mongoose');
const staffBuilder = require('./staffBuilder');
const mongooseComposer = require('graphql-compose-mongoose');
const connector = require('./mongoConnector');

const staffSchema = staffBuilder.schema(mongoose);
const staffModel = mongoose.model(staffBuilder.collectionName, staffSchema, staffBuilder.collectionName);

/*const staffSchemaTC = mongooseComposer.composeWithMongoose(staffModel);

const resolversData = {
	staffById: 'findById',
	staffByIds: 'findByIds',
	staffOne: 'findOne',
	staffMany: 'findMany',
	staffCount: 'count',
};

const mutationsData = {
	staffCreate: 'createOne',
	staffUpdateById: 'updateById',
	staffUpdateOne: 'updateOne',
	staffUpdateMany: 'updateMany',
	staffRemoveById: 'removeById',
	staffRemoveOne: 'removeOne',
	staffRemoveMany: 'removeMany',
};*/


module.exports = {
	model: staffModel,
	init(){
		return connector(mongoose, null);
	}
};






