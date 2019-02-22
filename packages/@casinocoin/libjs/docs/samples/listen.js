'use strict';
const CasinocoinAPI = require('../../src').CasinocoinAPI; // require('casinocoin-libjs')

const api = new CasinocoinAPI({ server: 'ws://127.0.0.1:6006' });
//const address = 'cMhWoNXXXBBemk7UuKS2mvZBk355Nbk2YA';
const address = 'cHb9CJAWyB4cj91VRWn96DkukG4bwdtyTh';

api.connect().then(() => {
    api.on('ledger', ledger => {
      console.log(JSON.stringify(ledger, null, 2));
    });
}).catch(error => {
	console.log(JSON.stringify(error));
});
