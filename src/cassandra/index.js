const pg = require('pg');
const connector = require('./connector');
const schema = require('./staffSchema');

module.exports = {
	pool: null,
	init(){
		return new Promise((resolve, reject) => {
			try {
				this.pool = connector.init(pg);
				resolve();
			} catch (e) {
				reject(e)
			}
		})
	},
	async queryRunner({query, values}){
		const client = await this.pool.connect();
		let result = await client.query(query, values);
		client.release();
		return result ? result.rows : null;
	},
	async findByID(id) {
		return (
			await this.queryRunner(schema.createSelectById(id))
		)[0];
	},
	async find(params) {
		return await this.queryRunner(schema.createSelectStatement(params));
	},
	async insert(params) {
		return (
			await this.queryRunner(schema.createInsert(params))
		)[0];
	},
	async delete(id) {
		await this.queryRunner(schema.createDeleteStatement(id));
	},
	async update(id, params) {
		return (
			await this.queryRunner(schema.createUpdateStatement(params, id))
		)[0];
	}
};



