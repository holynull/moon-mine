const MoonMine = artifacts.require('MoonMine');
const log4js = require('log4js');
const log4jsConfig = {
	appenders: {
		stdout: {
			type: 'stdout',
			layout: {
				type: 'pattern',
				pattern: '%[[%d] [%p] [%f{2}:%l] %m'
			}
		},
	},
	categories: { default: { appenders: ["stdout"], level: "debug", enableCallStack: true } }
};
log4js.configure(log4jsConfig);
const logger = log4js.getLogger('Test RaRi');

contract("MoonMine", accounts => {
	it("非owner设置非0地址为proxy，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.setProxy(accounts[0], { from: accounts[2] });
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:caller is not the owner)/);
		}
	});
	it("owner设置0地址为proxy，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.setProxy("0x0000000000000000000000000000000000000000");
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:PROXY_MUST_NOT_BE_0)/);
		}
	});
	it("owner设置非0地址为proxy，应该执行成功", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.setProxy(accounts[4]);
			assert.equal(1, 1, "success");
		} catch (e) {
			assert.equal(1, 0, "failed");
		}
	});

	it("非owner设置非0地址为token，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.setToken(accounts[0], { from: accounts[2] });
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:caller is not the owner)/);
		}
	});
	it("owner设置0地址为token，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.setToken("0x0000000000000000000000000000000000000000");
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:TOKEN_MUST_NOT_BE_0)/);
		}
	});
	it("owner设置非0地址为token，应该执行成功", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.setToken(accounts[4]);
			assert.equal(1, 1, "success");
		} catch (e) {
			assert.equal(1, 0, "failed");
		}
	});
	it("who参数为0调用claim函数，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.claim("0x0000000000000000000000000000000000000000", "100");
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:USER_MUST_NOT_BE_0)/);
		}
	});
	it("非proxy地址调用claim函数，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.claim(accounts[1], "100");
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:PROXY_ONLY)/);
		}
	});

	it("非owner调用doOverride，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.doOverride(accounts, [100, 100, 100], { from: accounts[2] });
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:caller is not the owner)/);
		}
	});
	it("地址和数量不匹配，调用doOverride，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.doOverride(accounts, [100, 100, 100]);
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:DATA_NOT_MATCH)/);
		}
	});
	it("地址中有0地址，调用doOverride，应该执行失败", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.doOverride([accounts[0], accounts[2], "0x0000000000000000000000000000000000000000"], [100, 100, 100]);
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:USER_ADDRESS_MUST_NOT_BE_0)/);
		}
	});
	it("调用doOverride，应该执行成功", async () => {
		let mine = await MoonMine.deployed();
		try {
			await mine.doOverride([accounts[0], accounts[2], accounts[3]], [100, 100, 100]);
			assert.equal(1, 1, "success");
		} catch (e) {
			assert.equal(1, 0, "failed");
		}
	});
});