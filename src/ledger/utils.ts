import * as _ from "lodash";
import * as assert from "assert";
import * as common from "../common";
import { Connection } from "../common";
import { TransactionType } from "./transaction-types";
import { Issue } from "../common/types.js";

const dropsToCsc = common.dropsToCsc;

type RecursiveData = {
  marker: string,
  results: any[],
};

type Getter = (marker?: string, limit?: number) => Promise<RecursiveData>;

function clamp(value: number, min: number, max: number): number {
  assert(min <= max, "Illegal clamp bounds");
  return Math.min(Math.max(value, min), max);
}

function getCSCBalance(
  connection: Connection,
  address: string,
  ledgerVersion?: number,
): Promise<number> {
  const request = {
    account: address,
    command: "account_info",
    ledger_index: ledgerVersion,
  };
  return connection.request(request).then((data: any) =>
    dropsToCsc(data.account_data.Balance));
}

// If the marker is omitted from a response, you have reached the end
function getRecursiveRecur(getter: Getter, limit: number, marker?: string | undefined): Promise<any[]> {
  return getter(marker, limit).then((data) => {
    const remaining = limit - data.results.length;
    if (remaining > 0 && data.marker !== undefined) {
      return getRecursiveRecur(getter, remaining, data.marker).then((results) =>
        data.results.concat(results),
      );
    }
    return data.results.slice(0, limit);
  });
}

function getRecursive(getter: Getter, limit?: number): Promise<any[]> {
  return getRecursiveRecur(getter, limit || Infinity, undefined);
}

function renameCounterpartyToIssuer<T>(
  obj: T & {counterparty?: string, issuer?: string},
): (T & {issuer?: string}) {
const issuer = (obj.counterparty !== undefined) ?
  obj.counterparty :
  ((obj.issuer !== undefined) ? obj.issuer : undefined);
const withIssuer = _.assign({}, obj, {issuer});
delete withIssuer.counterparty;
return withIssuer;
}

type RequestBookOffersArgs = { taker_gets: Issue, taker_pays: Issue };

function renameCounterpartyToIssuerInOrder(order: RequestBookOffersArgs) {
  const takerGets = renameCounterpartyToIssuer(order.taker_gets);
  const takerPays = renameCounterpartyToIssuer(order.taker_pays);
  const changes = { takerGets, takerPays };
  return _.assign({}, order, _.omit(changes, _.isUndefined));
}

function signum(num: number) {
  return (num === 0) ? 0 : (num > 0 ? 1 : -1);
}

/**
 *  Order two casinocoind transactions based on their ledger_index.
 *  If two transactions took place in the same ledger, sort
 *  them based on TransactionIndex
 *  See: https://casinocoin.com/build/transactions/
 *
 *  @param {Object} first
 *  @param {Object} second
 *  @returns {Number} [-1, 0, 1]
 */

function compareTransactions(first: TransactionType, second: TransactionType): number {
  if (!first.outcome || !second.outcome) {
    return 0;
  }
  if (first.outcome.ledgerVersion === second.outcome.ledgerVersion) {
    return signum(first.outcome.indexInLedger - second.outcome.indexInLedger);
  }
  return first.outcome.ledgerVersion < second.outcome.ledgerVersion ? -1 : 1;
}

function hasCompleteLedgerRange(
  connection: Connection,
  minLedgerVersion?: number,
  maxLedgerVersion?: number,
): Promise<boolean> {
  const firstLedgerVersion = 10; // Ripple lost the first 32570 ledger versions, Casinocoin should have most
  return connection.hasLedgerVersions(
    minLedgerVersion || firstLedgerVersion, maxLedgerVersion);
}

function isPendingLedgerVersion(
  connection: Connection,
  maxLedgerVersion?: number,
): Promise<boolean> {
  return connection.getLedgerVersion().then((ledgerVersion: any) =>
    ledgerVersion < (maxLedgerVersion || 0));
}

function ensureLedgerVersion(options: any): Promise<number> {
  if (Boolean(options) && options.ledgerVersion !== undefined &&
    options.ledgerVersion !== null
  ) {
    return Promise.resolve(options);
  }
  return this.getLedgerVersion().then((ledgerVersion: any) =>
    _.assign({}, options, { ledgerVersion }));
}

export {
  clamp,
  common,
  getCSCBalance,
  ensureLedgerVersion,
  compareTransactions,
  renameCounterpartyToIssuer,
  renameCounterpartyToIssuerInOrder,
  getRecursive,
  hasCompleteLedgerRange,
  isPendingLedgerVersion,
};
