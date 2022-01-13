const MineProxy = artifacts.require("MineProxy");
const HuaHuaToken = artifacts.require('HuaHuaToken');
const MoonMine = artifacts.require('MoonMine');
const MoonMineJson = require("../build/contracts/MoonMine.json");
const mnemonic = require('../secret');
const ethers = require('ethers');
const signer = ethers.Wallet.fromMnemonic(mnemonic.deployer, "m/44'/60'/0'/0/1"); // accounts[1]
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

contract("MineProxy", async accounts => {
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
});