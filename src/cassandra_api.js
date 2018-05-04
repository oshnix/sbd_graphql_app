const assert = require('assert').strict;
const cassandra = require('cassandra-driver');
let client = null;

module.exports = {
	init(){
		client = new cassandra.Client({
			contactPoints: ['127.0.0.2', '127.0.0.3', '127.0.0.4'],
			policies : {
				loadBalancing : new cassandra.policies.loadBalancing.RoundRobinPolicy(),
				reconnection: new cassandra.policies.reconnection.ConstantReconnectionPolicy(30),
			},

		});
		return new Promise((resolve, reject) => {
	        client.connect( err => {
				client.hosts.forEach(function (host) {
					console.log(host.address, host.datacenter, host.rack);
				});

				if(err) reject(err);
		        else resolve();
	        });
		})
	},
	getAllPersons(){
		let query = "select * from log.persons";
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
		return "insert into log.persons (ID,FirstName,LastName,NickName,StatusChange,Salary, Position,bossId, timestamp)" +
            " values('" + id + "','" + firstName + "','" + lastName + "','" + nickname + "','" + statusChange + "'," + salary + ",'" + position + "','" + bossId + "',toTimestamp(now()));";
	},
	//name, govermentForm,population,HDI
	createInsertCountryStatement(name, govermentForm,population,HDI){
		return "insert into log.countries (name, govermentForm, population,hpi,timestamp)" +
            " values('" + name + "','" + govermentForm + "'," + population + "," + HDI + ",toTimestamp(now()));";
	},
	createInsertEventStatement(ID,date,description,type){
		let query = "insert into log.events(ID,date,description,type,timestamp) values (";
		query += "'" + ID + "','" + date + "','" + description + "','" + type + "',toTimestamp(now()));";
		return query;
	},
	createInsertEventTestStatement(ID,date,description,type){
		let query = "insert into test.events(ID,date,description,type,timestamp) values (";
		query += "'" + ID + "','" + date + "','" + description + "','" + type + "',toTimestamp(now()));";
		return query;
	},
	createInsertLinkStatement(ID1,ID2,type){
		let query = "insert into log.links(ID1, ID2, type,timestamp) values (";
		query += "'" + ID1 + "','" + ID2 + "','" + type + "',toTimestamp(now()));";
		return query;
	},
	createInsertLinkTestStatement(ID1,ID2,type){
		let query = "insert into test.links(ID1, ID2, type,timestamp) values (";
		query += "'" + ID1 + "','" + ID2 + "','" + type + "',toTimestamp(now()));";
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
		let query = this.createInsertPersonStatement(id,bossId,firstName,lastName, nickname, position, salary, statusChange);

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
	/*insertPersons(ids,bossIds,firstNames,lastNames, nicknames, positions, salaries, statusChanges){
		let queries = [];
		for(let i = 0; i < ids.length; ++i){
			queries.push(this.createInsertPersonStatement(ids[i],bossIds[i],firstNames[i],lastNames[i],nicknames[i],positions[i],salaries[i],statusChanges[i]));
		}
		return new Promise((resolve, reject) => {
			client.batch(queries, (err, result) => {
				if(!err){
					resolve(result.rows);
				} else {
					reject(err);
				}
			})
		})
	},*/
	removePerson(id){
		let query = "delete from log.persons where id='" + id + "'";
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
	//!!!
	/*selectTop10Persons(id){
		query = "select * from log.persons where id='" + id + "' limit 10;";
		//query="select * from log.persons";
		return new Promise((resolve, reject) => {
			client.execute(query, (err, result) => {
				if(!err){
					resolve(result.rows);
				} else {
					reject(err);
				}
			})
		})
	},*/
	selectTopNPersons(id,N){
		let query = "select * from log.persons where id='" + id + "' limit " + N + ";";
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
		query = this.createInsertCountryStatement(name, governmentForm,population,HDI);
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
		query = "select * from log.countries where name='" + name + "'";
		//timestamp>='"+begin+"' AND timestamp<='"+end+"'";
		if(begin != null){
			query += " AND timestamp>='" + begin + "'";
		}
		if(end != null){
			query += " AND timestamp<='" + end + "'";
		}
		query += ";";
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
		query = this.createInsertEventStatement(id,date,description,type);
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
		queries = [];
		for(let i = 0;i < ids.length;++i){
			queries.push(this.createInsertEventStatement(IDs[i],dates[i],descriptions[i],types[i]));
		}
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
		query = this.createInsertLinkStatement(id1,id2,type);
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
		queries = [];
		for(let i = 0;i < id1s.length;++i){
			queries.push(this.createInsertLinkStatement(id1s[i],id2s[i],types[i]));
		}
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
		queries = [];
		for(let i = 0;i < id1s.length;++i){
			queries.push(this.createInsertLinkTestStatement(id1s[i],id2s[i],types[i]));
		}

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
		let queries = [];
		for(let i = 0;i < ids.length;++i){
			queries.push(this.createInsertEventTestStatement(IDs[i],dates[i],descriptions[i],types[i]));
		}
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
};