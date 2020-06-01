/* eslint-env mocha */
const assert = require('assert');
const meerkat = require('../index');
const models = require('./model/models.js');

describe('test1', () => {
	describe('seq 1', () => {
		it('異常系', () => {
			// assert.equal(job.checkNum(Infinity, 0, 49), '型異常');
			// assert.equal(job.checkNum(NaN, 3, 49), '型異常');
			// assert.equal(job.checkNum(undefined, 3, 49), '型異常');
			// assert.equal(job.checkNum(null, 0, 49), '型異常');
			// assert.equal(job.checkNum(-1, 1, 49), '値範囲異常');
			// assert.equal(job.checkNum(0, 1, 49), '値範囲異常');
			// assert.equal(job.checkNum(50, 1, 49), '値範囲異常');
		});
		it('正常系', () => {
			// assert.equal(job.checkNum(15, 3, 49), '');
			// assert.equal(job.checkNum(3, 3, 49), '');
			// assert.equal(job.checkNum(49, 3, 49), '');
			// assert.equal(job.checkNum('25', 3, 49), '');
			// assert.equal(job.checkNum('3', 3, 49), '');
			// assert.equal(job.checkNum('49', 0, 49), '');
		});
	});
});
