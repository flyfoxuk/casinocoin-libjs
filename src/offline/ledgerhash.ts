import * as _ from "lodash";
import * as common from "../common";
import hashes from "casinocoin-libjs-hashes";

function convertLedgerHeader(header: any): any {
  return {
    account_hash: header.stateHash,
    close_flags: header.closeFlags,
    close_time: common.iso8601ToCasinocoinTime(header.closeTime),
    close_time_resolution: header.closeTimeResolution,
    hash: header.ledgerHash,
    ledger_hash: header.ledgerHash,
    ledger_index: header.ledgerVersion.toString(),
    parent_close_time: common.iso8601ToCasinocoinTime(header.parentCloseTime),
    parent_hash: header.parentLedgerHash,
    seqNum: header.ledgerVersion.toString(),
    totalCoins: header.totalDrops,
    total_coins: header.totalDrops,
    transaction_hash: header.transactionHash,
  };
}

function hashLedgerHeader(ledgerHeader: any) {
  const header = convertLedgerHeader(ledgerHeader);
  return hashes.computeLedgerHash(header);
}

function computeTransactionHash(ledger: any, version: any) {
  if (ledger.rawTransactions === undefined) {
    return ledger.transactionHash;
  }
  const transactions: any[] = JSON.parse(ledger.rawTransactions);
  const txs = _.map(transactions, (tx) => {
    const mergeTx = _.assign({}, _.omit(tx, "tx"), tx.tx || {});
    const renameMeta = _.assign({}, _.omit(mergeTx, "meta"),
      tx.meta ? { metaData: tx.meta } : {});
    return renameMeta;
  });
  const transactionHash = hashes.computeTransactionTreeHash(txs, version);
  if (ledger.transactionHash !== undefined &&
    ledger.transactionHash !== transactionHash) {
    throw new common.errors.ValidationError("transactionHash in header" +
      " does not match computed hash of transactions");
  }
  return transactionHash;
}

function computeStateHash(ledger: any, version: any) {
  if (ledger.rawState === undefined) {
    return ledger.stateHash;
  }
  const state = JSON.parse(ledger.rawState);
  const stateHash = hashes.computeStateTreeHash(state, version);
  if (ledger.stateHash !== undefined && ledger.stateHash !== stateHash) {
    throw new common.errors.ValidationError("stateHash in header" +
      " does not match computed hash of state");
  }
  return stateHash;
}

const sLcfShaMapV2 = 0x02;

function computeLedgerHash(ledger: any): string {
  const version = ((ledger.closeFlags & sLcfShaMapV2) === 0) ? 1 : 2;
  const subhashes = {
    stateHash: computeStateHash(ledger, version),
    transactionHash: computeTransactionHash(ledger, version),
  };
  return hashLedgerHeader(_.assign({}, ledger, subhashes));
}

export default computeLedgerHash;
