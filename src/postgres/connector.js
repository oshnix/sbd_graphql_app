
module.exports.init = (pg) => {
	const pool = new pg.Pool();
	pool.on('error', err => {
		console.error(err)
	});

	return pool;
};