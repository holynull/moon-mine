const MineProxy = artifacts.require("MineProxy");
const HuaHuaToken = artifacts.require('HuaHuaToken');
const MoonMine = artifacts.require('MoonMine');
const MoonMineJson = require("../build/contracts/MoonMine.json");
const mnemonic = require('../secret');
const ethers = require('ethers');
const signer = ethers.Wallet.fromMnemonic(mnemonic.deployer, "m/44'/60'/0'/0/1"); // accounts[1]
const illegalSigner = ethers.Wallet.fromMnemonic(mnemonic.deployer, "m/44'/60'/0'/0/4"); // accounts[1]
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

contract("MineProxy", accounts => {
	let pub_owner = accounts[0];
	let pub_signer = accounts[1];
	let pub_tokenOwner = accounts[2];
	let pub_user = accounts[3];
	it("测试proxy的claim，应该执行成功。", async () => {
		try {
			let proxy = await MineProxy.deployed();
			let hht = await HuaHuaToken.deployed();
			let mine = await MoonMine.deployed();
			// 钱包必须授权给mine合约转账
			await hht.approve(mine.address, ethers.utils.parseEther('1000'), { from: pub_tokenOwner });

			const mineInterface = new ethers.utils.Interface(MoonMineJson.abi);
			const callData = mineInterface.encodeFunctionData('claim', [pub_user, ethers.utils.parseEther('100')]);
			let hash = ethers.utils.keccak256(callData);
			const signature = await signer.signMessage(ethers.utils.arrayify(hash));
			await proxy.callClaim(callData, signature);
			let balance = await hht.balanceOf(pub_user);
			assert.equal(100, Number(ethers.utils.formatEther(balance.toString())), 'hh balance wrong.');
		} catch (e) {
			logger.error(e.message);
			assert.equal(1, 0, 'claim failed!');
		}
	});
	it("tokenOwner没有授权，应该执行失败。", async () => {
		try {
			let proxy = await MineProxy.deployed();
			let hht = await HuaHuaToken.deployed();
			let mine = await MoonMine.deployed();
			// 钱包必须授权给mine合约转账
			// await hht.approve(mine.address, ethers.utils.parseEther('1000'), { from: pub_tokenOwner });

			const mineInterface = new ethers.utils.Interface(MoonMineJson.abi);
			const callData = mineInterface.encodeFunctionData('claim', [pub_user, ethers.utils.parseEther('100')]);
			let hash = ethers.utils.keccak256(callData);
			const signature = await signer.signMessage(ethers.utils.arrayify(hash));
			await proxy.callClaim(callData, signature);
			let balance = await hht.balanceOf(pub_user);
			assert.equal(100, 101, 'excute success');
		} catch (e) {
			expect(e.message).to.match(/(?:DELEGATE_CALL_FAILED)/);
		}
	});
	it("执行篡改数据，应该执行失败。", async () => {
		try {
			let proxy = await MineProxy.deployed();
			let hht = await HuaHuaToken.deployed();
			let mine = await MoonMine.deployed();
			// 钱包必须授权给mine合约转账
			await hht.approve(mine.address, ethers.utils.parseEther('1000'), { from: pub_tokenOwner });

			const mineInterface = new ethers.utils.Interface(MoonMineJson.abi);
			const callData = mineInterface.encodeFunctionData('claim', [pub_user, ethers.utils.parseEther('100')]);
			let hash = ethers.utils.keccak256(callData);
			const signature = await signer.signMessage(ethers.utils.arrayify(hash));
			// 生成一个篡改数据，让proxy合约执行
			let wrongData = mineInterface.encodeFunctionData('claim', [pub_user, ethers.utils.parseEther('1000')]);
			await proxy.callClaim(wrongData, signature);
			let balance = await hht.balanceOf(pub_user);
			assert.equal(100, Number(ethers.utils.formatEther(balance.toString())), 'hh balance wrong.');
		} catch (e) {
			// logger.error(e.message);
			expect(e.message).to.match(/(?:SIGNATURE_IS_WRONG)/);
		}
	});
	it("使用非法signer签名，应该执行失败。", async () => {
		try {
			let proxy = await MineProxy.deployed();
			let hht = await HuaHuaToken.deployed();
			let mine = await MoonMine.deployed();
			// 钱包必须授权给mine合约转账
			await hht.approve(mine.address, ethers.utils.parseEther('1000'), { from: pub_tokenOwner });

			const mineInterface = new ethers.utils.Interface(MoonMineJson.abi);
			const callData = mineInterface.encodeFunctionData('claim', [pub_user, ethers.utils.parseEther('100')]);
			let hash = ethers.utils.keccak256(callData);
			// 使用非法签名
			const signature = await illegalSigner.signMessage(ethers.utils.arrayify(hash));
			await proxy.callClaim(callData, signature);
			let balance = await hht.balanceOf(pub_user);
			assert.equal(100, Number(ethers.utils.formatEther(balance.toString())), 'hh balance wrong.');
		} catch (e) {
			// logger.error(e.message);
			expect(e.message).to.match(/(?:SIGNATURE_IS_WRONG)/);
		}
	});
	it("设置signer为0地址，应该执行失败", async () => {
		let proxy = await MineProxy.deployed();
		try {
			await proxy.setSigner("0x0000000000000000000000000000000000000000");
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:SIGNER_CAN_NOT_BE_0)/);
		}
	});
	it("设置mine为0地址，应该执行失败", async () => {
		let proxy = await MineProxy.deployed();
		try {
			await proxy.setMine("0x0000000000000000000000000000000000000000");
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:MINE_CAN_NOT_BE_0)/);
		}
	});
	it("非owner设置signer为非0地址，应该执行失败", async () => {
		let proxy = await MineProxy.deployed();
		try {
			await proxy.setSigner(accounts[0], { from: accounts[1] });
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:caller is not the owner)/);
		}
	});
	it("非owner设置mine为非0地址，应该执行失败", async () => {
		let proxy = await MineProxy.deployed();
		try {
			await proxy.setMine(accounts[0], { from: accounts[1] });
			assert.equal(1, 0, "success");
		} catch (e) {
			expect(e.message).to.match(/(?:caller is not the owner)/);
		}
	});
	it("设置signer为非0地址，应该执行成功", async () => {
		let proxy = await MineProxy.deployed();
		try {
			await proxy.setSigner(accounts[4]);
			assert.equal(1, 1, "success");
		} catch (e) {
			assert.equal(1, 0, "failed");
		}
	});
	it("设置mine为非0地址，应该执行成功", async () => {
		let proxy = await MineProxy.deployed();
		try {
			await proxy.setMine(accounts[4]);
			assert.equal(1, 1, "success");
		} catch (e) {
			assert.equal(1, 0, "failed");
		}
	});
});