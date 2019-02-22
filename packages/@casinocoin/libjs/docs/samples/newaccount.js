'use strict';
const CasinocoinAPI = require('../../src').CasinocoinAPI; // require('casinocoin-libjs')

const api = new CasinocoinAPI({ server: 'ws://127.0.0.1:6006' });

api.connect().then(() => {
	var account = api.generateAddress();
	console.log(JSON.stringify(account));
	process.exit();
}).catch(error => {
	console.log(JSON.stringify(error));
});
