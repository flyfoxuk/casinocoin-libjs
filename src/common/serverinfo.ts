import * as _ from "lodash";
import { convertKeysFromSnakeCaseToCamelCase, dropsToCsc } from "./utils";
import Connection from "./connection";

export interface IGetServerInfoResponse {
  buildVersion: string;
  completeLedgers: string;
  // hostID: string;
  ioLatencyMs: number;
  load?: {
    jobTypes: Object[],
    threads: number,
  };
  lastClose: {
    convergeTimeS: number,
    proposers: number,
  };
  loadFactor: number;
  peers: number;
  pubkeyNode: string;
  pubkeyValidator?: string;
  serverState: string;
  validatedLedger: {
    age: number,
    baseFeeCSC: string,
    hash: string,
    reserveBaseCSC: string,
    reserveIncrementCSC: string,
    ledgerVersion: number,
  };
  validationQuorum: number;
}

function renameKeys(object: any, mapping: any) {
  _.forEach(mapping, (to, from) => {
    object[to] = object[from];
    delete object[from];
  });
}

function getServerInfo(connection: Connection): Promise<IGetServerInfoResponse> {
  return connection.request({ command: "server_state" }).then((response) => {
    const info = convertKeysFromSnakeCaseToCamelCase(response.state);
    // renameKeys(info, { hostid: "hostID" })
    if (info.validatedLedger) {
      renameKeys(info.validatedLedger, {
        baseFee: "baseFeeCSC",
        reserveBase: "reserveBaseCSC",
        reserveInc: "reserveIncrementCSC",
        seq: "ledgerVersion",
      });
      info.validatedLedger.baseFeeCSC = dropsToCsc(info.validatedLedger.baseFeeCSC.toString());
      info.validatedLedger.reserveBaseCSC = dropsToCsc(info.validatedLedger.reserveBaseCSC.toString());
      info.validatedLedger.reserveIncrementCSC = dropsToCsc(info.validatedLedger.reserveIncrementCSC.toString());
    }
    return info;
  });
}

function computeFeeFromServerInfo(cushion: number, serverInfo: IGetServerInfoResponse): string {
  return serverInfo.validatedLedger.baseFeeCSC;
}

// TODO: This was originally annotated to return a number, but actually
// returned a toString"ed number. Should this actually be returning a number?
// REF: https://github.com/ripple/ripple-lib/pull/816/files#diff-8bd0d8b5573e50a2151f1149c444cf32
function getFee(connection: Connection, cushion: number): Promise<string> {
  return getServerInfo(connection).then((serverInfo) => {
    return computeFeeFromServerInfo(cushion, serverInfo);
  });
}

export {
  getServerInfo,
  getFee,
};
