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

        const resultPromise = session.run(
            'CREATE (a:Person {ID: $ID}), MATCH (a:Person {ID: $ID}),(b:Person {ID: $bossID}) create (b)-[r:SUIT]->(a) RETURN a',
            {ID: ID},
            {ID: ID, bossID: bossID}

        )

        resultPromise.then(result => {
            session.close();
            const singleRecord = result.records[0];
            const node = singleRecord.get(0);
            console.log(result);
            return node;
        });
    },
    deleteHuman(){
        let session = driver.session();

        const resultPromise = session.run(
            'MATCH (n:Person { name: $ID }) DELETE n',
            {ID: ID}


    )

        resultPromise.then(result => {
            session.close();
            const singleRecord = result.records[0];
            const node = singleRecord.get(0);
            console.log(result);
            return node;
        });
    },

};