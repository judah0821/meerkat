const meerkat = require('../index');
const models = require('./model/models.js');

//meerkat.execute(models.TestDb);
(async () => {
	// await meerkat.replace(
	// 	models.TestDb,
	// 	{},
	// 	{
	// 		test_dbs: [
	// 			{
	// 				name: 'name',
	// 				sumary: 'test', // 概要
	// 				detail: 'aiueo', // 詳細
	// 				updateDate: new Date(), // 日付
	// 				sort: 5,
	// 			},
	// 			{
	// 				name: 'name2',
	// 				sumary: 'test2', // 概要
	// 				detail: 'aiueo2', // 詳細
	// 				updateDate: new Date(), // 日付
	// 				sort: 5,
	// 			},
	// 		],
	// 	}
	// );

	const ret0 = await meerkat.socket(
		{
			action: 'replace',
			data: {
				test_dbs: [
					{
						name: 'name',
						sumary: 'test', // 概要
						detail: 'aiueo', // 詳細
						updateDate: new Date(), // 日付
						sort: 5,
					},
					{
						name: 'name2',
						sumary: 'test2', // 概要
						detail: 'aiueo2', // 詳細
						updateDate: new Date(), // 日付
						sort: 5,
					},
				],
			},
		}, //ユーザ入力
		{
			//設定
			replace: { security: false },
			list: { security: false },
		},
		{}, //セッションデータ
		models.TestDb
	);
	console.debug(ret0);

	const ret01 = await meerkat.socket(
		{
			action: 'upsert',
			data: {
				test_db: {
					name: 'name3',
					sumary: 'test3', // 概要
					detail: 'aiueo3', // 詳細
					updateDate: new Date(), // 日付
					sort: 53,
				},
			},
		}, //ユーザ入力
		{
			//設定
			upsert: {
				security: false,
				conditions: {
					name: 'name3',
				},
			},
			list: { security: false },
		},
		{}, //セッションデータ
		models.TestDb
	);
	console.debug(ret01);

	const ret1 = await meerkat.socket(
		{ action: 'list' }, //ユーザ入力
		{
			//設定
			replace: { security: false },
			list: { security: false },
		},
		{}, //セッションデータ
		models.TestDb
	);
	console.debug(ret1);

	const ret2 = await meerkat.socket(
		{ action: 'one' }, //ユーザ入力
		{
			//設定
			one: { security: false, conditions: { sumary: 'test' } },
			list: { security: false },
		},
		{}, //セッションデータ
		models.TestDb
	);
	console.debug(ret2);

	process.exit(0);
})();
