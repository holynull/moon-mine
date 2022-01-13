const MineProxy = artifacts.require("MineProxy");

module.exports = function (deployer, network,accounts) {
	return deployer.deploy(MineProxy, accounts[1], accounts[0]).then(() => {
	});
};
