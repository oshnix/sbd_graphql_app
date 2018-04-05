let connection = null;
const assert = require('assert').strict;
const cassandra = require('cassandra-driver');
let client = null;

module.exports = {
    init(){
        client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });
        return new Promise((resolve, reject) => {
	        client.connect( err => {
		        if(err) reject(err);
		        else resolve();
	        });
        })
    },
    fillTestLinks(globalCount){
        if(globalCount<0)
            return;
        const_types=['participant','creator','destroyer'];
        //globalCount=0;
        //while(globalCount<700000) {
            id1s = [];
            id2s = [];
            types = [];
            for (i = 0; i < 50; i++) {
                id1s.push(Math.floor(Math.random() * 1000));
                id2s.push(Math.floor(Math.random() * 1000));
                number = Math.floor(Math.random() * 3);
                types.push(const_types[number]);
            }
            this.insertTestLinks(id1s, id2s, types).then(result =>{
                //globalCount+=900;
                this.fillTestLinks(globalCount-50);
                console.log(globalCount);
            }).catch(error =>{
                console.error(error);
            })
        //}
    },
    fillTestEvents(globalCount){
        if(globalCount<0)
            return;
        const_types=['inner','outer'];
        const_desc=['Всё сломалось','Верхновная рада переимновала украинские ВДВ',
        'Пластмассовый мир победил','"Арсенал" разгромил ЦСКА в Лиге Европы',
        'Правление Университета Арктики обсудит в Якутске вопросы академической мобильности',
        'Скотленд-Ярд обнародовал заявление Юлии Скрипаль',
            'Порошенко заявил, что в мае начнется Операция объединенных сил в Донбассе',
            'Уезжающие американские дипломаты рассказали про свои впечатления о России',
            'Умерла детская писательница Ирина Токмакова',
            'Небензя: Сергей Скрипаль не представлял никакой угрозы для России',
            'Times: британские спецслужбы уверены, что знают место производства вещества из Солсбери',
            'На Азовском море создана опергруппа для недопущения пиратства со стороны Украины',
            'Захарова: британские власти хранят странное молчание о судьбе домашних животных Скрипалей',
            'WP: США введут к пятнице санкции по меньшей мере против шести российских олигархов',
            'МИД Чехии: заявление посла РФ по делу Скрипаля грозит межгосударственными осложнениями',
            'В Роструде напомнили про выходные и рабочие дни в апреле и мае 2018 года',
            'Россия получила ответы ОЗХО по делу Скрипаля',
            'Скотленд-Ярд обнародовал заявление Юлии Скрипаль',
            'Порошенко заявил, что в мае начнется Операция объединенных сил в Донбассе',
            'Потерявший семью при пожаре в Кемерове показал в Instagram видео с эвакуацией из ТЦ'];
        //globalCount=0;
        //while(globalCount<700000) {
        ids = [];
        dates = [];
        descs=[];
        types = [];
        for (i = 0; i < 200; i++) {
            ids.push(Math.floor(Math.random() * 10000));
            dates.push((Math.floor(Math.random() * 117+1900).toString()+'-0'+Math.floor(Math.random() * 8+1).toString()+'-'+Math.floor(Math.random() * 17+10).toString()));
            number = Math.floor(Math.random() * 17);
            descs.push(const_desc[number]);
            number = Math.floor(Math.random());
            types.push(const_types[number]);
        }
        //IDs,dates,descriptions,types
        this.insertTestEvents(ids, dates, descs,types).then(result =>{
            //globalCount+=900;
            this.fillTestEvents(globalCount-200);
            console.log(globalCount);
        }).catch(error =>{
            console.error(error);
        })
        //}
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
    //name, govermentForm,population,HDI
    createInsertCountryStatement(name, govermentForm,population,HDI){
        return "insert into log.countries (name, govermentForm, population,hpi,timestamp)"+
            " values('"+name+"','"+govermentForm+"',"+population+","+HDI+",toTimestamp(now()));";
    },
    createInsertEventStatement(ID,date,description,type){
        query="insert into log.events(ID,date,description,type,timestamp) values (";
        query+="'"+ID+"','"+date+"','"+description+"','"+type+"',toTimestamp(now()));";
        return query;
    },
    createInsertEventTestStatement(ID,date,description,type){
        query="insert into test.events(ID,date,description,type,timestamp) values (";
        query+="'"+ID+"','"+date+"','"+description+"','"+type+"',toTimestamp(now()));";
        return query;
    },
    createInsertLinkStatement(ID1,ID2,type){
        query="insert into log.links(ID1, ID2, type,timestamp) values (";
        query+="'"+ID1+"','"+ID2+"','"+type+"',toTimestamp(now()));";
        return query;
    },
    createInsertLinkTestStatement(ID1,ID2,type){
        query="insert into test.links(ID1, ID2, type,timestamp) values (";
        query+="'"+ID1+"','"+ID2+"','"+type+"',toTimestamp(now()));";
        return query;
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
    insertPersons(ids,bossIds,firstNames,lastNames, nicknames, positions, salaries, statusChanges){
        queries=[];
        for(var i=0;i<ids.length;++i){
            queries.push(this.createInsertPersonStatement(ids[i],bossIds[i],firstNames[i],lastNames[i],nicknames[i],positions[i],salaries[i],statusChanges[i]));
        }
        console.log(queries);
        return new Promise((resolve, reject) => {
            client.batch(queries, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
        //client.batch(queries);
    },

    removePerson(id){
        query="delete from log.persons where id='"+id+"'";
        return new Promise((resolve, reject) => {
            client.execute(query, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
        //client.execute(query);
    },
//!!!
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
    /**
     *
     * @param name string
     * @param governmentForm string
     * @param population int
     * @param HDI float
     */

    insertCountry(name, governmentForm,population,HDI){
        query=this.createInsertCountryStatement(name, governmentForm,population,HDI);
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
        //client.execute(query);
        //return null;
    },
    selectCountry(name, begin,end){
        query="select * from log.countries where name='"+name+"'";
        //timestamp>='"+begin+"' AND timestamp<='"+end+"'";
        if(begin!=null){
            query+=" AND timestamp>='"+begin+"'";
        }
        if(end!=null){
            query+=" AND timestamp<='"+end+"'";
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
    insertEvent(id,date,description,type){
        query=this.createInsertEventStatement(id,date,description,type);
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
        //client.execute(query);

    },
    insertEvents(IDs,dates,descriptions,types){
        queries=[];
        for(var i=0;i<ids.length;++i){
            queries.push(this.createInsertEventStatement(IDs[i],dates[i],descriptions[i],types[i]));
        }
        console.log(queries);
        return new Promise((resolve, reject) => {
            client.batch(queries, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
        //client.batch(queries);

    },
    insertLink(id1,id2,type){
        query=this.createInsertLinkStatement(id1,id2,type);
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
        //client.execute(query);
    },
    insertLinks(id1s,id2s,types){
        queries=[];
        for(var i=0;i<id1s.length;++i){
            queries.push(this.createInsertLinkStatement(id1s[i],id2s[i],types[i]));
        }
        console.log(queries);
        return new Promise((resolve, reject) => {
            client.batch(query, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
        //client.batch(queries);
    },
    insertTestLinks(id1s,id2s,types){
        queries=[];
        for(var i=0;i<id1s.length;++i){
            queries.push(this.createInsertLinkTestStatement(id1s[i],id2s[i],types[i]));
        }
        //console.log(queries);
        return new Promise((resolve, reject) => {
            client.batch(queries, (err, result) => {
                if(!err){
                    //console.log(result);
                    resolve();
                } else {
                    reject(err);
                }
            })
        })
        //client.batch(queries);
    },
    insertTestEvents(IDs,dates,descriptions,types){
        queries=[];
        for(var i=0;i<ids.length;++i){
            queries.push(this.createInsertEventTestStatement(IDs[i],dates[i],descriptions[i],types[i]));
        }
        //console.log(queries);
        return new Promise((resolve, reject) => {
            client.batch(queries, (err, result) => {
                if(!err){
                    resolve(result.rows);
                } else {
                    reject(err);
                }
            })
        })
        //client.batch(queries);

    },
    returnHumanLogs(params){
        const cassandra=require('cassandra-driver');
        const client = new cassandra.Client({ contactPoints: ['127.0.0.1'] });
        client.connect(function (err) {
            assert.ifError(err);
        });
        console.log('before query');
        query="select * from log.persons";
        /*var res=null;
        client.execute(query, function (err, result) {
           return result.rows;
            console.log(result.rows);
        });
        console.log('after query');
        console.log('after query');

        var authProvider = new cassandra.auth.PlainTextAuthProvider('atepaevm', 'root');
        console.log(authProvider);
        Set the auth provider in the clientOptions when creating the Client instance authProvider: authProvider,
        const client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'log' });
       console.log(client);
        query="select * from log.persons";
        return await client.execute(query);*/

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