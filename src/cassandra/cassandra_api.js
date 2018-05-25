const assert = require('assert').strict;
const cassandra = require('cassandra-driver');
let client = null;
const table = 'cache.persons';

const schema = [
    {key: 'staffId'},
    {key: 'firstName'},
    {key: 'lastName'},
    {key: 'nickname'},
    {key: 'birthDate'},
    {key: 'creationDate'},
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
       let query='insert into cache.persons("staffId","firstName","lastName","nickname","birthDate","creationDate","position","bossId", "isActive","salary","description","status")\
        values(';
        query+=params.staffId+",";
        query+="'"+params.firstName+"',";
        query+="'"+params.lastName+"',";
        query+="'"+params.nickname+"',";
        query+="'"+params.birthDate+"',";
        query+="'"+params.creationDate+"',";
        query+="'"+params.position+"',";
        if(params.bossId!=null){
            query+="'"+params.bossId+"',";
        }
        else{
            query+=params.bossId+",";
        }

        query+=params.isActive+",";
        query+=params.salary+",";
        query+="'"+params.description+"',{'"+params.status[0]+"'";
        for(i=1;i<params.status.length;++i){
            query+=",'"+params.status[i]+"'";
        }
        query+="});";
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

   async findById(id){
        let query = 'select * from cache.persons where "staffId"=' + id +";";
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
    find(params){
        query="select * from cache.persons where ";
        if (params.hasOwnProperty('staffId')) {
            query+=' AND "staffId"='+params.staffId;
        }
        if (params.hasOwnProperty('firstName')) {
            query+=' AND "firstName"=\''+params.firstName+"'"
        }
        if (params.hasOwnProperty('lastName')) {
            query+=' AND "lastName"=\''+params.lastName+"'";
        }
        if (params.hasOwnProperty('nickname')) {
            query+=' AND "nickname"=\''+params.nickname+"'";
        }
        if (params.hasOwnProperty('birthDate')) {
            query+=' AND "birthDate"=\''+params.birthDate+"'";
        }
        if (params.hasOwnProperty('creationDate')) {
            query+=' AND "creationDate"=\''+params.creationDate+"'";
        }
        if (params.hasOwnProperty('position')) {
            query+=' AND "position"=\''+params.position+"'";
        }
        if (params.hasOwnProperty('bossId')) {
            if(params.bossId==null)
                i=0;
                //query+=" AND bossId="+params.bossId;
            else
                query+=' AND "bossId"=\''+params.bossId+"'";
        }
        if (params.hasOwnProperty('isActive')) {
            query+=' AND "isActive"='+params.isActive;
        }
        if (params.hasOwnProperty('salary')) {
            query+=' AND "salary"='+params.salary;
        }
        if (params.hasOwnProperty('description')) {
            query+=' AND "description"=\''+params.description+"'";
        }
        query+=" allow filtering;";
        query=query.replace("AND","");
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
    update(id,params){
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