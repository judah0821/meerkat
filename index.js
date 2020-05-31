const pluralize = require('pluralize');

const responseSuccess = function(request, response, data) {
	const result = {
		result: 0,
		data,
	};
	response.json(result);
};

const responseValicationError = function(request, response, error) {
	const result = {
		result: 1,
		request: { url: request.url, body: request.body, headers: request.headers },
		error,
	};
	response.json(result);
};

const responseError = function(request, response, error, stack) {
	const result = {
		result: 2,
		stack,
		request: { url: request.url, body: request.body, headers: request.headers },
		error,
	};
	response.json(result);
};

const responseAuthError = function(request, response, error, stack) {
	const result = {
		result: 3,
		stack,
		request: { url: request.url, body: request.body, headers: request.headers },
		error,
	};
	response.json(result);
};

/**
 * API自動生成ライブラリ
 */
module.exports = {
	async execute(action, request, response, settings, MongoSchema) {
		try {
			console.log('req:', request.body);

			// アクションチェック
			if (!settings || !settings[action]) {
				responseError(request, response, 'ivalid action.');
				return;
			}

			/*
			 * １件出力
			 */
			if (action === 'one') {
				// console.debug(request.session); // セッションテスト(とれてない？)
				// console.debug(request.user);

				let result = null;
				let results = null;
				if (settings[action].security) {
					if (!request.user) {
						responseAuthError(request, response, 'not logged in');
						return;
					}

					results = await MongoSchema.find({
						userId: request.user.userId,
						...settings[action].conditions,
					}).sort({
						...settings[action].order,
					});
				} else {
					results = await MongoSchema.find({ ...settings[action].conditions }).sort({
						...settings[action].order,
					});
				}

				if (results.length === 0) {
					responseSuccess(request, response, result);
					return;
				}
				if (results.length === 1) {
					result = results[0];
					responseSuccess(request, response, result);
					return;
				}
				responseError(request, response, 'too many results.');
				return;
			}

			/*
			 * 全件出力
			 */
			if (action === 'list') {
				// console.debug(request.session); // セッションテスト(とれてない？)
				// console.debug(request.user);

				let results = null;
				if (settings[action].security) {
					if (!request.user) {
						responseAuthError(request, response, 'not logged in');
						return;
					}

					results = await MongoSchema.find({
						userId: request.user.userId,
						...settings[action].conditions,
					}).sort({
						...settings[action].order,
					});
				} else {
					results = await MongoSchema.find({ ...settings[action].conditions })
						.sort({
							...settings[action].order, // orderがobjectでも挿入順にならぶとのこと、無理なら二次元配列にする
						})
						.select({ _id: -1 }); //TODO 暫定
				}

				responseSuccess(request, response, results);
				return;
			}

			/*
			 * 全件置換
			 * test:param
			 */
			if (action === 'replace') {
				// 入力チェック
				// スキーマ名の複数形の配列であること
				const modelName = pluralize(MongoSchema.modelName);
				if (!request.body || !request.body[modelName] || !(request.body[modelName] instanceof Array)) {
					responseError(request, response, `NG:error body :${modelName}`);
					return;
				}
				// TODO:論理削除データの関連リソース削除
				// TODO:論理削除データを除外

				if (settings[action].security) {
					if (!request.user) {
						responseAuthError(request, response, 'not logged in');
						return;
					}

					// データ一括チェック
					for (const item of request.body[modelName]) {
						// チェックデータ作成
						const test = new MongoSchema(item);
						test.userId = request.user.userId; // セッションから設定

						const error = test.validateSync(); // save時ではキャッチできない
						if (error) {
							responseValicationError(request, response, error);
							return;
						}

						// TODO:削除条件と挿入条件が一致しているかチェック
					}

					// データ削除
					await MongoSchema.deleteMany({ userId: request.user.userId, ...settings[action].conditions }); // セッションから設定
					// TODO:関連データを消さないといけないのでchangeFlgやコールバックを検討

					// データ一括登録
					for (const item of request.body[modelName]) {
						// 問題集データ作成
						const test = new MongoSchema(item);
						test.userId = request.user.userId; // セッションから設定
						test._id = null;
						await test.save();
					}
				} else {
					// データ一括チェック
					for (const item of request.body[modelName]) {
						// チェックデータ
						const test = new MongoSchema(item);

						const error = test.validateSync(); // save時ではキャッチできない
						if (error) {
							responseValicationError(request, response, error);
							return;
						}

						// TODO:削除条件と挿入条件が一致しているかチェック
					}

					// データ削除
					await MongoSchema.deleteMany({ ...settings[action].conditions });
					// TODO:関連データを消さないといけないのでchangeFlgやコールバックを検討

					// データ一括登録
					for (const item of request.body[modelName]) {
						// 問題集データ作成
						const test = new MongoSchema(item);
						test._id = null;
						await test.save();
					}
				}

				responseSuccess(request, response, null);
				return;
			}

			/*
			 * 更新または挿入
			 * test:param
			 */
			if (action === 'upsert') {
				// 入力チェック
				const modelName = MongoSchema.modelName;
				if (!request.body || !request.body[modelName]) {
					responseError(request, response, `NG:error body :${modelName}`);
					return;
				}

				const item = request.body[modelName];

				if (settings[action].security) {
					if (!request.user) {
						responseAuthError(request, response, 'not logged in');
						return;
					}
					// チェックデータ
					const test = new MongoSchema(item);
					test.userId = request.user.userId; // セッションから設定

					const error = test.validateSync(); // save時ではキャッチできない
					if (error) {
						responseValicationError(request, response, error);
						return;
					}

					// upsert
					await MongoSchema.update({ userId: request.user.userId, ...settings[action].conditions }, item, {
						upsert: true,
					});
				} else {
					// チェックデータ
					const test = new MongoSchema(item);

					const error = test.validateSync(); // save時ではキャッチできない
					if (error) {
						responseValicationError(request, response, error);
						return;
					}

					// upsert
					await MongoSchema.update({ ...settings[action].conditions }, item, {
						upsert: true,
					});
				}

				responseSuccess(request, response, null);
				return;
			}
		} catch (err) {
			console.log(err.stack);

			responseError(request, response, err, err.stack);
		} finally {
			//
		}
	},
};
