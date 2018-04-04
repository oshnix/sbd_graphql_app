let cassandraApi = require('./src/cassandra_api');
let neo4jApi = require('./src/neo4j_api');
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
 */
cassandraApi.init();
try{
    //let res=cassandraApi.selectTop10Persons("2");
    //console.log(res);
    let res=cassandraApi.getAllPersons().then();
    console.log(res);
}
catch (e) {
    console.log(e.stack);
}
console.log("After all");
let entry=[{
    name:'Myname'
},{
    name:'Myname'
}]

//console.log(cassandraApi.returnHumanLogs(null));
//console.log('server ends');
//let result = cassandraApi.runProcess();
