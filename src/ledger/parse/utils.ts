import * as _ from "lodash";
import transactionParser = require("casinocoin-libjs-transactionparser");
import * as utils from "../utils";
import BigNumber from "bignumber.js";
import parseAmount from "./amount";
import { Amount, Memo } from "../../common/types";

function adjustQualityForCSC(
  quality: string, takerGetsCurrency: string, takerPaysCurrency: string,
) {
  // quality = takerPays.value/takerGets.value
  // using drops (1e-8 CSC) for CSC values
  console.log("adjustQualityForCSC");
  const numeratorShift = (takerPaysCurrency === "CSC" ? -8 : 0);
  const denominatorShift = (takerGetsCurrency === "CSC" ? -8 : 0);
  const shift = numeratorShift - denominatorShift;
  return shift === 0 ? quality :
    (new BigNumber(quality)).shift(shift).toString();
}

function parseQuality(quality?: number | null): number | undefined {
  if (typeof quality !== "number") {
    return;
  }
  return (new BigNumber(quality)).shift(-9).toNumber();
}

function parseTimestamp(casinocoinTime?: number | null): string | undefined {
  if (typeof casinocoinTime !== "number") {
    return;
  }

  return utils.common.casinocoinTimeToISO8601(casinocoinTime);
}

function removeEmptyCounterparty(amount: any) {
  if (amount.counterparty === "") {
    delete amount.counterparty;
  }
}

function removeEmptyCounterpartyInBalanceChanges(balanceChanges: any[]) {
  _.forEach(balanceChanges, (changes) => {
    _.forEach(changes, removeEmptyCounterparty);
  });
}

function removeEmptyCounterpartyInOrderbookChanges(orderbookChanges: any[]) {
  _.forEach(orderbookChanges, (changes) => {
    _.forEach(changes, (change) => {
      _.forEach(change, removeEmptyCounterparty);
    });
  });
}

function isPartialPayment(tx: any) {
  return (tx.Flags & utils.common.txFlags.Payment.PartialPayment) !== 0;
}

function parseDeliveredAmount(tx: any): Amount|void {

  if (tx.TransactionType !== "Payment" ||
    tx.meta.TransactionResult !== "tesSUCCESS") {
    return undefined;
  }

  if (tx.meta.delivered_amount &&
    tx.meta.delivered_amount === "unavailable") {
    return undefined;
  }

  // parsable delivered_amount
  if (tx.meta.delivered_amount) {
    return parseAmount(tx.meta.delivered_amount);
  }

  // DeliveredAmount only present on partial payments
  if (tx.meta.DeliveredAmount) {
    return parseAmount(tx.meta.DeliveredAmount);
  }

  // no partial payment flag, use tx.Amount
  if (tx.Amount && !isPartialPayment(tx)) {
    return parseAmount(tx.Amount);
  }

  // DeliveredAmount field was introduced at
  // ledger 4594095 - after that point its absence
  // on a tx flagged as partial payment indicates
  // the full amount was transferred. The amount
  // transferred with a partial payment before
  // that date must be derived from metadata.
  if (tx.Amount && tx.ledger_index > 4594094) {
    return parseAmount(tx.Amount);
  }

  return undefined;
}

function parseOutcome(tx: any): any|undefined {
  const metadata = tx.meta || tx.metaData;
  if (!metadata) {
    return undefined;
  }
  const balanceChanges = transactionParser.parseBalanceChanges(metadata);
  const orderbookChanges = transactionParser.parseOrderbookChanges(metadata);
  removeEmptyCounterpartyInBalanceChanges(balanceChanges);
  removeEmptyCounterpartyInOrderbookChanges(orderbookChanges);

  return utils.common.removeUndefined({
    balanceChanges,
    deliveredAmount: parseDeliveredAmount(tx),
    fee: utils.common.dropsToCsc(tx.Fee),
    indexInLedger: tx.meta.TransactionIndex,
    ledgerVersion: tx.ledger_index,
    orderbookChanges,
    result: tx.meta.TransactionResult,
    timestamp: parseTimestamp(tx.date),
  });
}

function hexToString(hex: string): string|undefined {
  return hex ? new Buffer(hex, "hex").toString("utf-8") : undefined;
}

function parseMemos(tx: any): Memo[]|undefined {
  if (!Array.isArray(tx.Memos) || tx.Memos.length === 0) {
    return undefined;
  }
  return tx.Memos.map((m: any) => {
    return utils.common.removeUndefined({
      data: m.Memo.parsed_memo_data || hexToString(m.Memo.MemoData),
      format: m.Memo.parsed_memo_format || hexToString(m.Memo.MemoFormat),
      type: m.Memo.parsed_memo_type || hexToString(m.Memo.MemoType),
    });
  });
}

export {
  parseQuality,
  parseOutcome,
  parseMemos,
  hexToString,
  parseTimestamp,
  adjustQualityForCSC,
  isPartialPayment,
  dropsToCsc: utils.common.dropsToCsc,
  utils.common.constants,
  utils.common.txFlags,
  utils.common.removeUndefined,
  utils.common.casinocoinTimeToISO8601,
};
