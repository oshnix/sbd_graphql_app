const user = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const database = process.env.MONGODB;
const host = process.env.MONGOHOST;
const uri = `mongodb://${user}:${password}@${host}/${database}`;

module.exports = (mongoose, options) => mongoose.connect(uri, options);