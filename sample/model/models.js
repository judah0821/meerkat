const mongoose = require('mongoose');

/** モデル読み込み */
const test = require('./testModel');

// 固定オプション
const options = { useUnifiedTopology: true, useNewUrlParser: true };

/** 接続 */
mongoose.connect('mongodb://localhost:27017/dev_meerkat_sample', options);

/** スキーマ定義エクスポート */
const Schema = mongoose.Schema;
module.exports = {
	TestDb: mongoose.model('test_db', new Schema(test)),
};
