import { CasinocoinAPI } from "casinocoin-libjs-api";
import { CasinocoinAPIBroadcast } from "casinocoin-libjs-api";
import ledgerClosed from "./fixtures/casinocoind/ledger-close";
import createMockCasinocoind from "./mock-casinocoind";
import getFreePort from "./utils/net-utils";

const setupMockCasinocoindConnection = (testcase: any, port: number) => {
  return new Promise((resolve: any, reject: any) => {
    testcase.mockCasinocoind = createMockCasinocoind(port);
    testcase._mockedServerPort = port;
    testcase.api = new CasinocoinAPI({ server: "ws://localhost:" + port });
    testcase.api.connect().then(() => {
      testcase.api.once("ledger", () => resolve());
      testcase.api.connection._ws.emit("message", JSON.stringify(ledgerClosed));
    }).catch(reject);
  });
};

const setupMockCasinocoindConnectionForBroadcast = (testcase: any, ports: number[]) => {
  return new Promise((resolve: any, reject: any) => {
    const servers = ports.map((localPort: number) => "ws://localhost:" + localPort);
    testcase.mocks = ports.map((localPort: number) => createMockCasinocoind(localPort));
    testcase.api = new CasinocoinAPIBroadcast(servers);
    testcase.api.connect().then(() => {
      testcase.api.once("ledger", () => resolve());
      testcase.mocks[0].socket.send(JSON.stringify(ledgerClosed));
    }).catch(reject);
  });
};

const setup = (): Promise<{}> => {
  return getFreePort().then((port: number) => {
    return setupMockCasinocoindConnection(this, port);
  });
};

const setupBroadcast = (): Promise<{}> =>  {
  return Promise.all([getFreePort(), getFreePort()]).then((ports: number[]) => {
    return setupMockCasinocoindConnectionForBroadcast(this, ports);
  });
};

const teardown = (done: any) => {
  this.api.disconnect().then(() => {
    if (this.mockCasinocoind !== undefined) {
      this.mockCasinocoind.close();
    } else {
      this.mocks.forEach((mock: any) => mock.close());
    }
    setImmediate(done);
  }).catch(done);
};

export {
  setup,
  teardown,
  setupBroadcast,
  createMockCasinocoind,
};
