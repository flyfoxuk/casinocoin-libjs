'use strict';
const CasinocoinAPI = require('../../src').CasinocoinAPI; // require('casinocoin-libjs')

const api = new CasinocoinAPI({ server: 'ws://wst02.casinocoin.org:7007' });
//const address = 'cMhWoNXXXBBemk7UuKS2mvZBk355Nbk2YA';
const address1 = 'cHb9CJAWyB4cj91VRWn96DkukG4bwdtyTh';
const address2 = 'cMhWoNXXXBBemk7UuKS2mvZBk355Nbk2YA';
const address3 = 'cHfUJkpqFoDqFJmDyV8ztg5QfoyMbL29Ap';

api.connect().then(() => {
    api.getBalances(address1).then(balances => {
        console.log('Address 1: ' + JSON.stringify(balances, null, 2));
    }).catch(error => {
	console.log(JSON.stringify(error));
    });
    api.getBalances(address2).then(balances => {
	console.log('Address 2: ' + JSON.stringify(balances, null, 2));
    }).catch(error => {
        console.log(JSON.stringify(error));
    });
    api.getBalances(address3).then(balances => {
        console.log('Address 3: ' + JSON.stringify(balances, null, 2));
    }).catch(error => {
        console.log(JSON.stringify(error));
    });
    api.getTransactions(address1).then(transactions => {
        console.log('Transactions: ' + JSON.stringify(transactions, null, 2));
    });
}).catch(error => {
	console.log(JSON.stringify(error));
});
