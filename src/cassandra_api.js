let connection = null;
const assert = require('assert').strict;
let cassandra=null;
let client=null;
module.exports = {
    init(){
    cassandra=require('cassandra-driver');
    client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });
    client.connect(function (err) {
        assert.ifError(err);
    });
    },
    getAllPersons(){
        query="select * from log.persons";
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

    createInsertPersonStatement(id,bossId,firstName,lastName, nickname, position, salary, statusChange){
        return "insert into log.persons (ID,FirstName,LastName,NickName,StatusChange,Salary, Position,bossId, timestamp)"+
            " values('"+id+"','"+firstName+"','"+lastName+"','"+nickname+"','"+statusChange+"',"+salary+",'"+position+"','"+bossId+"',toTimestamp(now()));";
    },
    /**
     * persons table:
     * @param id string
     * @param bossId string
     * @param firstName string
     * @param lastName string
     * @param nickname string
     * @param position string
     * @param salary int
     * @param statusChange string
     * @returns {Promise<any>}
     */
    insertPerson(id,bossId,firstName,lastName, nickname, position, salary, statusChange){
        query=this.createInsertPersonStatement(id,bossId,firstName,lastName, nickname, position, salary, statusChange);
        //query="insert into log.persons (ID,FirstName,LastName,NickName,StatusChange,Salary, Position,bossId, timestamp)"+
        //   " values('"+id+"','"+firstName+"','"+lastName+"','"+nickname+"','"+statusChange+"',"+salary+",'"+position+"','"+bossId+"',toTimestamp(now()));";
        console.log(query);
        client.execute(query);
    },
    insertPersons(ids,bossIds,firstNames,lastNames, nicknames, positions, salaries, statusChanges){
        queries=[];
        for(var i=0;i<ids.length;++i){
            queries.push(this.createInsertPersonStatement(ids[i],bossIds[i],firstNames[i],lastNames[i],nicknames[i],positions[i],salaries[i],statusChanges[i]));
        }
        console.log(queries);
        client.batch(queries);
    },

    removePerson(id){
        query="delete from log.persons where id='"+id+"'";
        client.execute(query);
    },

    selectTop10Persons(id){
        query="select * from log.persons where id='"+id+"' limit 10;";
        //query="select * from log.persons";
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
    selectTopNPersons(id,N){
        query="select * from log.persons where id='"+id+"' limit "+N+";";
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
    selectPersonsByField(id,begin,end,status,position){
        query="select * from log.persons where id='"+id+"'";
        //timestamp>='"+begin+"' AND timestamp<='"+end+"'";
        if(begin!=null){
            query+=" AND timestamp>='"+begin+"'";
        }
        if(end!=null){
            query+=" AND timestamp<='"+end+"'";
        }
        if(status!=null){
            query+=" AND statuschange='"+status+"'";
        }
        if(position!=null){
            query+=" AND position='"+position+"'";
        }
        query+=";";
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
    returnHumanLogs(params){
        const cassandra=require('cassandra-driver');
        const client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });
        client.connect(function (err) {
            assert.ifError(err);
        });
        console.log('before query');
        query="select * from log.persons";
        //var res=null;
        //client.execute(query, function (err, result) {
           // return result.rows;
            //console.log(result.rows);
        //});
        //console.log('after query');
        //console.log('after query');

        //var authProvider = new cassandra.auth.PlainTextAuthProvider('atepaevm', 'root');
        //console.log(authProvider);
        //Set the auth provider in the clientOptions when creating the Client instance authProvider: authProvider,
        //const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'log' });
       //console.log(client);
        //query="select * from log.persons";
        //return await client.execute(query);

    },
    returnCountry(){
        connection.select();
    },
    initConnection(){
      connection = cassandra.connect();
    },
    runProcess(){
        this.initConnection(param1, param2);
    }
};