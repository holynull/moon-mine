'use strict'
const getKeys = require('./src/getKeys');
const mnemonics = require('./secret.js');
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
const logger = log4js.getLogger('RARI-TOKEN');
let method = process.argv[2];

switch (method) {
	case 'showKeys':
		let keys = getKeys(mnemonics);
		logger.info(JSON.stringify(keys));
	default:
}