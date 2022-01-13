'use strict'

const ethers = require('ethers');

module.exports = function (mnemonics) {
	// 初始化rpc provider，浏览器中不需要
	// const provider = new ethers.providers.JsonRpcProvider(config.default.rpc.url);
	// 初始化助记词
	const walletMnemonic = ethers.Wallet.fromMnemonic(mnemonics.deployer);
	// 初始化钱包
	// const wallet = walletMnemonic.connect(provider);
	return { pbulicKey: walletMnemonic.address, privateKey: walletMnemonic.privateKey };
}