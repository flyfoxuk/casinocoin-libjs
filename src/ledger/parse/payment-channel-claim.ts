import * as assert from "assert";
import * as utils from "./utils";
import parseAmount from "./amount";
const claimFlags = utils.txFlags.PaymentChannelClaim;

function parsePaymentChannelClaim(tx: any): Object {
  assert(tx.TransactionType === "PaymentChannelClaim");

  return utils.removeUndefined({
    amount: tx.Amount && parseAmount(tx.Amount).value,
    balance: tx.Balance && parseAmount(tx.Balance).value,
    channel: tx.Channel,
    close: Boolean(tx.Flags & claimFlags.Close) || undefined,
    publicKey: tx.PublicKey,
    renew: Boolean(tx.Flags & claimFlags.Renew) || undefined,
    signature: tx.Signature,
  });
}

export default parsePaymentChannelClaim;
