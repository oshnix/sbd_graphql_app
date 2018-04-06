const mongoose = require('mongoose');
const staffBuilder = require('./staffBuilder');
const connector = require('./mongoConnector');

const staffSchema = staffBuilder.schema(mongoose);
const staffModel = mongoose.model(staffBuilder.collectionName, staffSchema, staffBuilder.collectionName);


module.exports = {
	model: staffModel,
	init(){
		return connector(mongoose, null);
	}
};






