import createMockCasinocoind from "./mock-casinocoind";

const port: number = 34371;
const main = () => {
  if (global.describe) {
    // we are running inside mocha, exiting
    return;
  }
  console.log("starting server on port " + port);
  createMockCasinocoind(port);
  console.log("starting server on port " + String(port + 1));
  createMockCasinocoind(port + 1);
};

main();
