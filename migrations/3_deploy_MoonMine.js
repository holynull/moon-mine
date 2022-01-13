const MoonMine = artifacts.require("MoonMine");
const MineProxy = artifacts.require("MineProxy");
const HuaHuaToken = artifacts.require("HuaHuaToken");

module.exports = function (deployer, network, accounts) {
	return deployer.deploy(MoonMine, MineProxy.address, HuaHuaToken.address, accounts[2], accounts[0]).then(() => {
		return MineProxy.deployed().then(proxy => {
			return proxy.setMine(MoonMine.address);
		})
	});
};
