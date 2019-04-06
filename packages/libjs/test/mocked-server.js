'use strict';


const port = 34371;

const createMockCasinocoind = require('./mock-casinocoind');

function main() {
  if (global.describe) {
    // we are running inside mocha, exiting
    return;
  }
  console.log('starting server on port ' + port);
  createMockCasinocoind(port);
  console.log('starting server on port ' + String(port + 1));
  createMockCasinocoind(port + 1);
}

main();
