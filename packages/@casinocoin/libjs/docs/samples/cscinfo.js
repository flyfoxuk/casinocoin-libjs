'use strict';
const CasinocoinAPI = require('../../src').CasinocoinAPI; // require('casinocoin-libjs')

const api = new CasinocoinAPI({ server: 'ws://lnx07.jochems.com:7007' });
//const address = 'cMhWoNXXXBBemk7UuKS2mvZBk355Nbk2YA';
const address = 'cHb9CJAWyB4cj91VRWn96DkukG4bwdtyTh';

api.connect().then(() => {
    api.getServerInfo().then(info => {
	console.log('Server: ' + JSON.stringify(info, null, 2));
    	api.getFee().then(fee => {
		console.log('Fee: ' + JSON.stringify(fee));
        	process.exit();
	});
    });
}).catch(error => {
	console.log(JSON.stringify(error));
});
