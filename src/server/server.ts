import * as common from "../common";
import { IGetServerInfoResponse } from "../common/serverinfo";

function isConnected(): boolean {
  return this.connection.isConnected();
}

function getLedgerVersion(): Promise<number> {
  return this.connection.getLedgerVersion();
}

function connect(): Promise<void> {
  return this.connection.connect();
}

function disconnect(): Promise<void> {
  return this.connection.disconnect();
}

function getServerInfo(): Promise<IGetServerInfoResponse> {
  return common.serverInfo.getServerInfo(this.connection);
}

function getFee(): Promise<string> {
  const cushion = this._feeCushion || 1.2;
  return common.serverInfo.getFee(this.connection, cushion);
}

function formatLedgerClose(ledgerClose: any): object {
  return {
    baseFeeCSC: common.dropsToCsc(ledgerClose.fee_base),
    ledgerHash: ledgerClose.ledger_hash,
    ledgerTimestamp: common.casinocoinTimeToISO8601(ledgerClose.ledger_time),
    ledgerVersion: ledgerClose.ledger_index,
    reserveBaseCSC: common.dropsToCsc(ledgerClose.reserve_base),
    reserveIncrementCSC: common.dropsToCsc(ledgerClose.reserve_inc),
    transactionCount: ledgerClose.txn_count,
    validatedLedgerVersions: ledgerClose.validated_ledgers,
  };
}

export {
  connect,
  disconnect,
  formatLedgerClose,
  getFee,
  getLedgerVersion,
  getServerInfo,
  isConnected,
};
