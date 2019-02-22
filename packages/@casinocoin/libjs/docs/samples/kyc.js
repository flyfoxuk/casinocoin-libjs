'use strict';
const CasinocoinAPI = require('../../src').CasinocoinAPI; // require('casinocoin-libjs')

const api = new CasinocoinAPI({ server: 'ws://wst02.casinocoin.org:7007' });
//const address = 'cMhWoNXXXBBemk7UuKS2mvZBk355Nbk2YA';
const mainWallet = 'cHb9CJAWyB4cj91VRWn96DkukG4bwdtyTh';
const kycAccount = 'cwmm2RkhynaPHXWCD94xcxLSVn1pJrU9Fh';
const account1   = 'cHfUJkpqFoDqFJmDyV8ztg5QfoyMbL29Ap';
const account2   = 'cHfUJkpqFoDqFJmDyV8ztg5QfoyMbL29Ap';
const mainSecret = 'snoPBcXtMeMyMHUVTgbuqAfg1SUTb';
const kycSecret = 'snU3EjU9kQXaLHgVYvXwZVPG293mq';

const instructions = { maxLedgerVersionOffset: 5, fee: '0.02' };
const payment = {
    source: { address: "", maxAmount: { value: '100.0', currency: 'CSC' } },
    destination: { address: "", amount: { value: '100.0', currency: 'CSC' } },
    allowPartialPayment: false
};

function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

api.connect().then(() => {
    // get the main wallet balance
    return api.getBalances(mainWallet);
}).then(mainBalance => {
    console.log('mainWallet: ' + JSON.stringify(mainBalance, null, 2));
    // get the kyc balance
    return api.getBalances(kycAccount);
}).then(kycBalance => {
    console.log('kycAccount: ' + JSON.stringify(kycBalance, null, 2));
    payment.source.address = mainWallet;
    payment.destination.address = account1;
    return api.preparePayment(mainWallet, payment, instructions);
}).then(prepared => {
    console.log('prepared: ' + JSON.stringify(prepared, null, 2));
    const { signedTransaction } = api.sign(prepared.txJSON, mainSecret);
    console.log('Payment transaction signed...');
    return api.submit(signedTransaction);
}).then((submitResult) => {
    console.log('submitResult: ' + JSON.stringify(submitResult, null, 2));
    // sleep 4 seconds to make sure the TX is validated
    return sleep(4000);
}).then(() => {
    return api.getBalances(account1);
}).then(balance1 => {
    console.log('account1: ' + JSON.stringify(balance1, null, 2));
    return api.getKYCInfo(account1);
}).then(kycInfo => {
    console.log('kycInfo: ' + JSON.stringify(kycInfo, null, 2));
    const kycSetTx = {
        kycAccount: kycAccount,
        destination: account1,
        verified: false
    };
    if(kycInfo.verified == false){
        // set to verified
        console.log('set verified to true and add UUID');
        kycSetTx.verified = true;
        kycSetTx.verifications = [];
        kycSetTx.verifications.push("9f68f6dc-3423-4f2c-b19f-84267254e442");
    }
    console.log('kycSetTx: ' + JSON.stringify(kycSetTx, null, 2));
    return api.prepareKYCSet(kycSetTx);
}).then(kycPrepared =>{
    console.log('kycPrepared: ' + JSON.stringify(kycPrepared, null, 2));
    const { signedTransaction } = api.sign(kycPrepared.txJSON, kycSecret);
    console.log('signedTransaction: ' + JSON.stringify(signedTransaction, null, 2));
    return api.submit(signedTransaction);
}).then((submitResult) => {
    console.log('submitResult: ' + JSON.stringify(submitResult, null, 2));
    // sleep 4 seconds to make sure the TX is validated
    return sleep(4000);
}).then(() => {
    return api.getKYCInfo(account1);
}).then(kycInfo => {
    console.log('kycInfo: ' + JSON.stringify(kycInfo, null, 2));
    process.exit();
}).catch(error => {
    console.log('error: ' + JSON.stringify(error));
    process.exit();
});