const cassandra = require('cassandra-driver');
let client = null;
const table = 'cache.persons';

const schema = [
    {key: 'staffId'},
    {key: 'firstName', value: value => `'${value}'`},
    {key: 'lastName', value: value => `'${value}'`},
    {key: 'nickname', value: value => `'${value}'`},
    {key: 'birthDate', value: value => dataToString(value)} ,
    {key: 'creationDate', value: value => dataToString(value)},
    {key: 'position', value: value => `'${value}'`},
    {key: 'bossId'},
    {key: 'isActive'},
    {key: 'salary'},
    {key: 'description', value: value => `'${value}'`},
    {key: 'status', value: value =>
            `{${value.map(item => "'" + item + "'").join(',')}}`
    }
];

function dataToString(date){
    return `'${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}'`
}

function parseParams(paramsObject){
    let keyArray = [];
    let valuesArray = [];
    Object.setPrototypeOf(paramsObject, Object);
    for (let schemaItem of schema) {
        if (paramsObject.hasOwnProperty(schemaItem.key)) {
            let value = paramsObject[schemaItem.key];
            keyArray.push(`"${schemaItem.key}"`);
            valuesArray.push(schemaItem.value ? schemaItem.value(value) : value);
        }
    }
    return {
        keyArray,
        valuesArray
    }
}

function matchParams({keyArray, valuesArray}, separator,  query = ''){
    if (keyArray.length > 0) {
        let matchArray = [];
        for (let i = 0; i < keyArray.length; i++) {
            matchArray.push(`${keyArray[i]} = ${valuesArray[i]}`);
        }
        query += matchArray.join(separator);
    } else {
        query = '';
    }
    return query;
}

module.exports = {
    delete(id){
        let query = 'delete from cache.persons where "staffId"=' + id;
        return new Promise((resolve, reject) => {
            client.execute(query, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
    },

    async insert(params){
        params.creationDate = new Date();
        let {keyArray, valuesArray} = parseParams(params);
        let query = `INSERT INTO ${table}(${keyArray.join(',')}) values(${valuesArray.join(',')})`;
        return new Promise((resolve, reject) => {
            client.execute(query, (err, result) => {
                if(!err){
                    resolve(params);
                } else {
                    reject(err);
                }
            })
        })
    },
    findById(id){
        let query = 'select * from cache.persons where "staffId"=' + Number(id);
        return new Promise((resolve, reject) => {
            client.execute(query, (err, result) => {
                if(!err){
                    resolve(result.rows.length > 0 ? result.rows[0] : null);
                } else {
                    reject(err);
                }
            })
        })
    },
    find(params){
        let {keyArray, valuesArray} = parseParams(params);
        let query = `SELECT * FROM ${table}`;
        query += matchParams({keyArray, valuesArray}, ' AND ', ' WHERE ');
        query+=" allow filtering;";
        return new Promise((resolve, reject) => {
            client.execute(query, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })

    },
    update(id,params){
		Object.setPrototypeOf(params, Object);
        query="update cache.persons ";
        if (params.hasOwnProperty("firstName")) {
            query+=', "firstName"=\''+params.firstName+"'";
        }
        if (params.hasOwnProperty('lastName')) {
            query+=', "lastName"=\''+params.lastName+"'";
        }
        if (params.hasOwnProperty('nickname')) {
            query+=', "nickname"=\''+params.nickname+"'";
        }
        if (params.hasOwnProperty('birthDate')) {
            query+=', "birthDate"=\''+params.birthDate+"'";
        }
        if (params.hasOwnProperty('creationDate')) {
            query+=', "creationDate"=\''+params.creationDate+"'";
        }
        if (params.hasOwnProperty('position')) {
            query+=', "position"=\''+params.position+"'";
        }
        if (params.hasOwnProperty('bossId')) {
            if(params.bossId==null)
                i=0;
            //query+=" AND bossId="+params.bossId;
            else
                query+=', "bossId"=\''+params.bossId+"'";
        }
        if (params.hasOwnProperty('isActive')) {
            query+=', "isActive"='+params.isActive;
        }
        if (params.hasOwnProperty('salary')) {
            query+=', "salary"='+params.salary;
        }
        if (params.hasOwnProperty('description')) {
            query+=', "description"=\''+params.description+"'";
        }
        query=query.replace(","," SET ");
        query+=' where "staffId"='+id+";";
        console.log(query);
        return new Promise((resolve, reject) => {
            client.execute(query, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
    },
	init(){
		client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });
		return new Promise((resolve, reject) => {
	        client.connect( err => {
		        if(err) reject(err);
		        else resolve();
	        });
		})
	}
};