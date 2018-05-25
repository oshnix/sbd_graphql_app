const table = 'STAFF';

const schema = [
	{key: 'staffId'},
	{key: 'firstName'},
	{key: 'lastName'},
	{key: 'nickname'},
	{key: 'birthDate'},
	{key: 'position'},
	{key: 'bossId'},
	{key: 'isActive'},
	{key: 'salary'},
	{key: 'description'},
	{key: 'status', value: value =>
		`{${value.map(item => '"' + item + '"').join(',')}}`
	}
];

function parseParams(paramsObject){
	let keyArray = [];
	let substParamArray = [];
	let valuesArray = [];
	Object.setPrototypeOf(paramsObject, Object);
	for (let schemaItem of schema) {
		if (paramsObject.hasOwnProperty(schemaItem.key)) {
			let value = paramsObject[schemaItem.key];
			keyArray.push(`"${schemaItem.key}"`);
			substParamArray.push(`$${substParamArray.length + 1}`);
			valuesArray.push(schemaItem.value ? schemaItem.value(value) : value);
		}
	}
	return {
		keyArray,
		substParamArray,
		valuesArray
	}
}

function matchParams({keyArray, substParamArray}, separator,  query = ''){
	if (keyArray.length > 0) {
		let matchArray = [];
		for (let i = 0; i < keyArray.length; i++) {
			matchArray.push(`${keyArray[i]} = ${substParamArray[i]}`);
		}
		query += matchArray.join(separator);
	} else {
		query = '';
	}
	return query;
}

module.exports = {
	createInsert(paramsObject){
		let {keyArray, substParamArray, valuesArray} = parseParams(paramsObject);
		let query = `INSERT INTO ${table}(${keyArray.join(',')}) VALUES(${substParamArray.join(',')}) RETURNING *`;
		return {
			query,
			values: valuesArray
		}
	},
	createSelectById(id){
		return this.createSelectStatement({staffId: id});
	},
	createSelectStatement(paramsObject){
		let {keyArray, substParamArray, valuesArray} = parseParams(paramsObject);
		let query = `SELECT * FROM ${table}`;
		query += matchParams({keyArray, substParamArray}, ' AND ', ' WHERE ');
		return {
			query,
			values: valuesArray
		}
	},
	createDeleteStatement(id) {
		let {keyArray, substParamArray, valuesArray} = parseParams({staffId: id});
		let query = `DELETE FROM ${table} WHERE ${keyArray[0]} = ${substParamArray[0]}`;
		return {
			query,
			values: valuesArray
		}
	},
	createUpdateStatement(paramsObject, id) {
		let {keyArray, substParamArray, valuesArray} = parseParams(paramsObject);
		let query = matchParams({keyArray, substParamArray}, ' ');
		if (query === '') throw new Error('At least one field must be updated');
		query = `UPDATE ${table} SET ${query} `;
		query += ` WHERE "staffId" = $${keyArray.length + 1} RETURNING *`;
		valuesArray.push(id);
		return {
			query,
			values: valuesArray
		}
	}
};