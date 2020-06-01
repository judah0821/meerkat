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

const socketSuccess = function(data, callback) {
	const result = {
		result: 0,
		data,
		callback,
	};
	return result;
};

const socketValicationError = function(error, param, callback) {
	const result = {
		result: 1,
		request: param,
		error,
		callback,
	};
	return result;
};

const socketError = function(error, param, callback, stack) {
	const result = {
		result: 2,
		stack,
		request: param,
		error,
	};
	return result;
};

const socketAuthError = function(error, param, callback, stack) {
	const result = {
		result: 3,
		stack,
		request: param,
		error,
	};
	return result;
};

/**
 * API自動生成ライブラリ
 */
module.exports = {
	async response(action, request, response, settings, MongoSchema) {
		try {
			console.log('req:', request.body);

			// アクションチェック
			if (!settings || !settings[action]) {
				responseError(request, response, 'ivalid action.');
				return;
			}

			//TODO セキュリティパターン追加 user:ユーザIDをセッションから設定、group?
			if (settings[action].security) {
				if (!request.user) {
					responseAuthError(request, response, 'not logged in');
					return;
				}
				// eslint-disable-next-line no-param-reassign
				settings[action].conditions.userId = request.user.userId;
			}

			/*
			 * １件出力
			 */
			if (action === 'one') {
				// console.debug(request.session); // セッションテスト(とれてない？)
				// console.debug(request.user);
				const result = await this.one(MongoSchema, settings[action]);
				responseSuccess(request, response, result);
				return;
			}

			/*
			 * 全件出力
			 */
			if (action === 'list') {
				// console.debug(request.session); // セッションテスト(とれてない？)
				// console.debug(request.user);

				const results = this.list(MongoSchema, settings[action]);

				responseSuccess(request, response, results);
				return;
			}

			/*
			 * 全件置換
			 * test:param
			 */
			if (action === 'replace') {
				let assignData = null;
				if (settings[action].security) {
					assignData = { userId: request.user };
				}
				const results = this.replace(MongoSchema, settings[action], request.body, assignData);

				responseSuccess(request, response, results);
				return;
			}

			/*
			 * 更新または挿入
			 * test:param
			 */
			if (action === 'upsert') {
				if (settings[action].security) {
					request.body.userId = request.user.userId; // セッションから設定 TODO:要確認 bodyに代入していいのか・・・
				}
				const result = this.upsert(MongoSchema, settings[action], request.body);

				responseSuccess(request, response, result);
				return;
			}
		} catch (err) {
			console.debug(err.stack);

			responseError(request, response, err, err.stack);
		} finally {
			//
		}
	},
	async socket(param, settings, session, MongoSchema) {
		try {
			console.log('param:', param);

			// アクションチェック
			if (!param || !param.action || !settings || !settings[param.action]) {
				return socketError('ivalid action.');
			}

			//TODO セキュリティパターン追加 user:ユーザIDをセッションから設定、group?
			if (settings[param.action].security) {
				if (!session.user) {
					return socketAuthError('not logged in', param, param.callback);
				}
				// eslint-disable-next-line no-param-reassign
				settings[param.action].conditions.userId = session.user.userId;
			}

			/*
			 * １件出力
			 */
			if (param.action === 'one') {
				// console.debug(request.session); // セッションテスト(とれてない？)
				// console.debug(request.user);
				const result = await this.one(MongoSchema, settings[param.action]);
				return socketSuccess(result, param.callback);
			}

			/*
			 * 全件出力
			 */
			if (param.action === 'list') {
				// console.debug(request.session); // セッションテスト(とれてない？)
				// console.debug(request.user);

				const results = await this.list(MongoSchema, settings[param.action]);

				return socketSuccess(results, param.callback);
			}

			/*
			 * 全件置換
			 * test:param
			 */
			if (param.action === 'replace') {
				let assignData = null;
				if (settings[param.action].security) {
					assignData = { userId: session.user };
				}
				const results = await this.replace(MongoSchema, settings[param.action], param.data, assignData);

				return socketSuccess(results, param.callback);
			}

			/*
			 * 更新または挿入
			 * test:param
			 */
			if (param.action === 'upsert') {
				const data = param.data;

				if (settings[param.action].security) {
					data.userId = param.data.user.userId; // セッションから設定
				}
				const result = await this.upsert(MongoSchema, settings[param.action], data);

				return socketSuccess(result, param.callback);
			}

			return socketError('action not found', param, param.callback);
		} catch (err) {
			console.debug(err.stack);

			return socketError(err, param, param.callback, err.stack);
		}
	},
	async one(MongoSchema, settings) {
		let result = null;
		const results = await MongoSchema.find({
			...settings.conditions,
		}).sort({
			...settings.order,
		});

		if (results.length === 0) {
			return null;
		}
		if (results.length === 1) {
			result = results[0];
			return result;
		}
		throw new Error('too many results.');
	},
	async list(MongoSchema, settings) {
		let results = null;

		results = await MongoSchema.find({
			...settings.conditions,
		}).sort({
			...settings.order,
		});
		return results;
	},
	async replace(MongoSchema, settings, data, assignData) {
		let results = null;

		// 入力チェック
		// スキーマ名の複数形の配列であること
		const modelName = pluralize(MongoSchema.modelName);
		if (!data || !data[modelName] || !(data[modelName] instanceof Array)) {
			throw new Error(`NG:error body :${modelName}`);
		}
		// TODO:論理削除データの関連リソース削除
		// TODO:論理削除データを除外

		// データ一括チェック
		for (const item of data[modelName]) {
			// チェックデータ作成
			if (assignData) {
				Object.assign(item, assignData);
			}
			const test = new MongoSchema(item);

			const error = test.validateSync(); // save時ではキャッチできない
			if (error) {
				throw new Error(error);
			}

			// TODO:削除条件と挿入条件が一致しているかチェック
		}

		// データ削除
		await MongoSchema.deleteMany({ ...settings.conditions }); // セッションから設定
		// TODO:関連データを消さないといけないのでchangeFlgやコールバックを検討

		// データ一括登録
		results = []; //TODO 後で追加
		for (const item of data[modelName]) {
			// 問題集データ作成
			if (assignData) {
				Object.assign(item, assignData);
			}
			const test = new MongoSchema(item);
			//test._id = null;
			results.push(await test.save());
		}

		return results;
	},
	async upsert(MongoSchema, settings, data) {
		let result = null;
		// 入力チェック
		const modelName = MongoSchema.modelName;
		if (!data || !data[modelName]) {
			throw new Error(`NG:error body :${modelName}`);
		}

		const item = data[modelName];

		// チェックデータ
		const test = new MongoSchema(item);

		const error = test.validateSync(); // save時ではキャッチできない
		if (error) {
			throw new Error(error);
		}

		// upsert
		result = await MongoSchema.updateMany({ ...settings.conditions }, item, {
			upsert: true,
		});

		return result;
	},
};
