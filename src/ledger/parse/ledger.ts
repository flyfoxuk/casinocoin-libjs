import * as _ from "lodash";
import { removeUndefined, casinocoinTimeToISO8601 } from "./utils";
import parseTransaction from "./transaction";
import { GetLedger } from "../types.js";

function parseTransactionWrapper(ledgerVersion: any, tx: any) {
  const transaction = _.assign({}, _.omit(tx, "metaData"), {
    ledger_index: ledgerVersion,
    meta: tx.metaData,
  });
  const result: any = parseTransaction(transaction);
  if (!result.outcome.ledgerVersion) {
    result.outcome.ledgerVersion = ledgerVersion;
  }
  return result;
}

function parseTransactions(transactions: any, ledgerVersion: any) {
  if (_.isEmpty(transactions)) {
    return {};
  }
  if (_.isString(transactions[0])) {
    return { transactionHashes: transactions };
  }
  return {
    rawTransactions: JSON.stringify(transactions),
    transactions: _.map(transactions,
      _.partial(parseTransactionWrapper, ledgerVersion)),
  };
}

function parseState(state: any) {
  if (_.isEmpty(state)) {
    return {};
  }
  if (_.isString(state[0])) {
    return { stateHashes: state };
  }
  return { rawState: JSON.stringify(state) };
}

function parseLedger(ledger: any): GetLedger {
  const ledgerVersion = parseInt(ledger.ledger_index || ledger.seqNum, 10);
  return removeUndefined(_.assign({
    closeFlags: ledger.close_flags,
    closeTime: casinocoinTimeToISO8601(ledger.close_time),
    closeTimeResolution: ledger.close_time_resolution,
    ledgerHash: ledger.hash || ledger.ledger_hash,
    ledgerVersion,
    parentCloseTime: casinocoinTimeToISO8601(ledger.parent_close_time),
    parentLedgerHash: ledger.parent_hash,
    stateHash: ledger.account_hash,
    totalDrops: ledger.total_coins || ledger.totalCoins,
    transactionHash: ledger.transaction_hash,
  },
    parseTransactions(ledger.transactions, ledgerVersion),
    parseState(ledger.accountState),
  ));
}

export default parseLedger;
