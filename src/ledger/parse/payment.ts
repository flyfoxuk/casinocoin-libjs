import * as _ from "lodash";
import * as assert from "assert";
import * as utils from "./utils";
import parseAmount from "./amount";

const txFlags = utils.txFlags;

function isNoDirectCasinocoin(tx: any) {
  return (tx.Flags & txFlags.Payment.NoCasinocoinDirect) !== 0;
}

function isQualityLimited(tx: any) {
  return (tx.Flags & txFlags.Payment.LimitQuality) !== 0;
}

function removeGenericCounterparty(amount: any, address: string) {
  return amount.counterparty === address ?
    _.omit(amount, "counterparty") : amount;
}

function parsePayment(tx: any): Object {
  assert(tx.TransactionType === "Payment");

  const source = {
    address: tx.Account,
    maxAmount: removeGenericCounterparty(
      parseAmount(tx.SendMax || tx.Amount), tx.Account),
    tag: tx.SourceTag,
  };

  const destination = {
    address: tx.Destination,
    amount: removeGenericCounterparty(parseAmount(tx.Amount), tx.Destination),
    tag: tx.DestinationTag,
  };

  return utils.removeUndefined({
    allowPartialPayment: utils.isPartialPayment(tx) || undefined,
    destination: utils.removeUndefined(destination),
    invoiceID: tx.InvoiceID,
    limitQuality: isQualityLimited(tx) || undefined,
    memos: utils.parseMemos(tx),
    noDirectCasinocoin: isNoDirectCasinocoin(tx) || undefined,
    paths: tx.Paths ? JSON.stringify(tx.Paths) : undefined,
    source: utils.removeUndefined(source),
  });
}

export default parsePayment;
