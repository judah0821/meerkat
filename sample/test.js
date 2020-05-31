const meerkat = require('../index');
const models = require('./model/models.js');

//meerkat.execute(models.TestDb);
(async () => {
	await meerkat.replace(
		models.TestDb,
		{},
		{
			test_dbs: [
				{
					name: 'name',
					sumary: 'test', // 概要
					detail: 'aiueo', // 詳細
					updateDate: new Date(), // 日付
					sort: 5,
				},
			],
		}
	);
	process.exit(0);
})();
