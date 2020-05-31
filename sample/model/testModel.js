module.exports = {
	name: { type: String, required: true },
	sumary: { type: String }, // 概要
	detail: { type: String }, // 詳細
	updateDate: { type: Date, default: Date.now }, // 日付
	sort: { type: Number, required: true },
};
