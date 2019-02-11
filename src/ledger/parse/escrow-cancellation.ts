import * as assert from "assert";
import { parseMemos, utils } from "./utils";

function parseEscrowCancellation(tx: any): Object {
  assert(tx.TransactionType === "EscrowCancel");

  return utils.removeUndefined({
    escrowSequence: tx.OfferSequence,
    memos: utils.parseMemos(tx),
    owner: tx.Owner,
  });
}

export default parseEscrowCancellation;
