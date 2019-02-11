import * as assert from "assert";
import * as utils from "./utils";
import parseAmount from "./amount";

function parsePaymentChannelCreate(tx: any): Object {
  assert(tx.TransactionType === "PaymentChannelCreate");

  return utils.removeUndefined({
    amount: parseAmount(tx.Amount).value,
    cancelAfter: tx.CancelAfter && utils.parseTimestamp(tx.CancelAfter),
    destination: tx.Destination,
    destinationTag: tx.DestinationTag,
    publicKey: tx.PublicKey,
    settleDelay: tx.SettleDelay,
    sourceTag: tx.SourceTag,
  });
}

export default parsePaymentChannelCreate;
