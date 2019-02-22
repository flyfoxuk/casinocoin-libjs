'use strict';
const CasinocoinAPI = require('../../src').CasinocoinAPI; // require('casinocoin-libjs')

const source_address = 'cHb9CJAWyB4cj91VRWn96DkukG4bwdtyTh';
const destination_address = 'cMhWoNXXXBBemk7UuKS2mvZBk355Nbk2YA';
// const destination_address = 'c3x6e4x6QzTSfQkWo8a1tsBob5QgZx5sxP3vS24V45uacrtyTYK9';

const secret = 'snoPBcXtMeMyMHUVTgbuqAfg1SUTb';

const api = new CasinocoinAPI({ server: 'ws://127.0.0.1:6006' });
const instructions = { maxLedgerVersionOffset: 5, fee: '0.1' };

const payment = {
    source: {
        address: source_address,
        maxAmount: {
            value: '10.0',
            currency: 'CSC'
        }
    },
    destination: {
        address: destination_address,
        amount: {
            value: '10.0',
            currency: 'CSC'
        }
    },
    allowPartialPayment: false,
    memos: [{data: 'This is a memo test', 'format': 'text/plain'}]
};

function quit(message) {
    console.log(message);
    process.exit(0);
}

function fail(message) {
    console.error(message);
    process.exit(1);
}

api.connect().then(() => {
    console.log('Connected...');
    return api.preparePayment(source_address, payment, instructions).then(prepared => {
        console.log(JSON.stringify(prepared, null, 2));
        console.log('Payment transaction prepared...');
        const { signedTransaction } = api.sign(prepared.txJSON, secret);
        console.log('Payment transaction signed...');
        api.submit(signedTransaction).then(quit, fail);
    });
}).catch(fail);
