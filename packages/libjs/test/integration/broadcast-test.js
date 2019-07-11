'use strict';
const {CasinocoinAPIBroadcast} = require('../../dist/npm/broadcast');

function main() {
  const servers = ['wss://ws01.casinocoin.org', 'wss://ws02.casinocoin.org'];
  const api = new CasinocoinAPIBroadcast(servers);
  api.connect().then(() => {
    api.getServerInfo().then(info => {
      console.log(JSON.stringify(info, null, 2));
    });
    api.on('ledger', ledger => {
      console.log(JSON.stringify(ledger, null, 2));
    });
  });
}

main();
