const neo4j = require('neo4j-driver').v1;
let driver = null;
module.exports = {
	/**
     *
     * @param {string} params
     * @returns {null}
     */

	init(){
		driver = neo4j.driver("bolt://167.99.42.105:7687", neo4j.auth.basic("neo4j", "Waran22"))
	},
	getCountryByName(countryName){
		let session = driver.session();

		const resultPromise = session.run(
			'match (a:Country {name: $name}) RETURN a',
			{name: countryName}
		);

		resultPromise.then(result => {
			session.close();
			const singleRecord = result.records[0];
			const node = singleRecord.get(0);
			console.log(node);
			//console.log(node.properties.population);
			return node;
		});

	},
	addHuman(ID, bossID){
		let session = driver.session();
		let resultPromise;

		if(bossID) {
			resultPromise = session.run(`
			MATCH (b:Person {ID: $boss})
			CREATE (a:Person {ID: $newID})<-[:headOf]-(b)
			return a`,
			{boss: bossID, newID: ID}
			);
		} else {
			resultPromise = session.run(`
			CREATE (a:Person {ID: $ID})
			return a`,
			{ID: ID});
		}

		resultPromise.then(result => {
			session.close();
			console.log(result);
		}).catch(error => {
			console.error(error);
		})
	},
	changePersonBoss(Id, bossId){
		let session = driver.session();
		return session.run(
			`MATCH (b:Person {ID: $boss}), (a:Person {ID: $ID2}) 
			CREATE (a)<-[:headOf]-(b) 
			return a, b`,
			{boss: bossId, ID2: Id}
		).then(result => {
			session.close();
			return result.records;
		})
	},
	deleteAllBossConnections(bossId){
		let session = driver.session();
		return session.run(
			`MATCH (n:Person { ID: $boss })-[r:headOf]->(y:Person) 
			DELETE r`,
			{ID: bossId}
		).then(() => {
			session.close();
		})
	},
	changeSlavesBoss(id, newBossId) {
		let session = driver.session();
		return session.run(
			`MATCH (p:Person { ID: $ID})-[:headOf]->(n:Person) 
			CREATE (n)<-[:headOf]-(a:Person { ID: $newboss})`,
			{ID: id, newboss: newBossId}
		).then(() => {
			session.close();
		})
	},
	getHumanBoss(ID, Lim){
		let session = driver.session();
		return session.run(
			`MATCH (p:Person { ID: $ID })<-[:headOf]-(boss:Person) RETURN boss limit $Lim`,
			{ID: ID, Lim}
		).then(result => {
			session.close();
			return result.records;
		})
	},
	getBossSlaves(ID, Lim){
		let session = driver.session();
		return session.run(
			`MATCH (p:Person { ID: $ID })-[:headOf]->(boss:Person)
			RETURN boss limit $Lim`,
			{ID: ID, Lim}
		).then(result => {
			session.close();
			return result.records;
		})
	},
	deleteHuman(ID){
		let session = driver.session();

		const resultPromise = session.run(
			'MATCH (n:Person { name: $ID }) DELETE n',
			{ID: ID}
		);

		return resultPromise.then(result => {
			session.close();
		});
	}
};