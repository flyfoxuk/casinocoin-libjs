import * as assert from "assert";
import * as utils from "./utils";
import parseAmount from "./amount";

function parsePaymentChannelFund(tx: any): Object {
  assert(tx.TransactionType === "PaymentChannelFund");

  return utils.removeUndefined({
    amount: parseAmount(tx.Amount).value,
    channel: tx.Channel,
    expiration: tx.Expiration && utils.parseTimestamp(tx.Expiration),
  });
}

export default parsePaymentChannelFund;
