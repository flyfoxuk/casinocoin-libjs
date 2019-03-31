import { CasinocoinAPI, CasinocoinAPIBroadcast } from "casinocoin-libjs-api";
import ledgerClosed from "./fixtures/casinocoind/ledger-close";

const portLocal = 34371;
const baseUrl = "ws://test.casinocoin.org:"; /* REPLACE */

const setup = (port: number = portLocal) => {
  const tapi = new CasinocoinAPI({ server: baseUrl + port });
  return tapi.connect().then(() => {
    return tapi.connection.request({
      command: "test_command",
      data: { openOnOtherPort: true },
    });
  }).then((got: any) => {
    return new Promise((resolve: any, reject: any) => {
      this.api = new CasinocoinAPI({ server: baseUrl + got.port });
      this.api.connect().then(() => {
        this.api.once("ledger", () => resolve());
        this.api.connection._ws.emit("message", JSON.stringify(ledgerClosed));
      }).catch(reject);
    });
  }).then(() => {
    return tapi.disconnect();
  });
};

const setupBroadcast = () => {
  const servers = [portLocal, portLocal + 1].map((portMapped) => baseUrl + portMapped);
  this.api = new CasinocoinAPIBroadcast(servers);
  return new Promise((resolve: any, reject: any) => {
    this.api.connect().then(() => {
      this.api.once("ledger", () => resolve());
      this.api._apis[0].connection._ws.emit("message",
        JSON.stringify(ledgerClosed));
    }).catch(reject);
  });
};

const teardown = () => {
  if (this.api.isConnected()) {
    return this.api.disconnect();
  }
  return undefined;
};

export {
  setup,
  teardown,
  setupBroadcast,
};
