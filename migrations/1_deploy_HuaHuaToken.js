const HuaHuaToken = artifacts.require("HuaHuaToken");

module.exports = function (deployer, network, accounts) {
	return deployer.deploy(HuaHuaToken, accounts[2]);
};
