import * as assert from "assert";
import * as utils from "./utils";

function parseEscrowExecution(tx: any): Object {
  assert(tx.TransactionType === "EscrowFinish");

  return utils.removeUndefined({
    condition: tx.Condition,
    escrowSequence: tx.OfferSequence,
    fulfillment: tx.Fulfillment,
    memos: utils.parseMemos(tx),
    owner: tx.Owner,
  });
}

export default parseEscrowExecution;
