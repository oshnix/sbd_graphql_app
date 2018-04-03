let connection = null;

module.exports = {
    returnHumanLogs(params){
        return null;
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