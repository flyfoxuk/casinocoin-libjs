import * as _ from "lodash";
import { CasinocoinAPI } from "./api";

class CasinocoinAPIBroadcast extends CasinocoinAPI {

  private ledgerVersion: number = 0;
  private apis: CasinocoinAPI[];

  constructor(servers: any, options: any) {
    super(options);

    const apis: CasinocoinAPI[] = servers.map((server: any) => new CasinocoinAPI(
      _.assign({}, options, { server }),
    ));

    // exposed for testing
    this.apis = apis;

    this.getMethodNames().forEach((name: string) => {
      this[name] = () => {
        return Promise.race(apis.map((api) => api[name](...arguments)));
      };
    });

    // connection methods must be overridden to apply to all api instances
    this.connect = async () => {
      return await Promise.all(apis.map((api) => api.connect()));
    };
    this.disconnect = async () => {
      return await Promise.all(apis.map((api) => api.disconnect()));
    };
    this.isConnected = () => {
      return apis.map((api) => api.isConnected()).every(Boolean);
    };

    // synchronous methods are all passed directly to the first api instance
    const defaultAPI = apis[0];
    const syncMethods = [ "sign", "generateAddress", "computeLedgerHash" ];
    syncMethods.forEach((name) => {
      this[name] = defaultAPI[name].bind(defaultAPI);
    });

    apis.forEach((api) => {
      api.on("ledger", this.onLedgerEvent.bind(this));
      api.on("error", (errorCode, errorMessage, data) =>
        this.emit("error", errorCode, errorMessage, data));
    });
  }

  public onLedgerEvent(ledger: any) {
    if (ledger.ledgerVersion > this.ledgerVersion) {
      this.ledgerVersion = ledger.ledgerVersion;
      this.emit("ledger", ledger);
    }
  }

  public getMethodNames() {
    const methodNames: string[] = [];
    const casinocoinAPI = this.apis[0];

    for (const name of _.keys(casinocoinAPI)) {
      if (typeof CasinocoinAPI.name === "function") {
        methodNames.push(name);
      }
    }
    return methodNames;
  }
}

export {
  CasinocoinAPIBroadcast,
};
