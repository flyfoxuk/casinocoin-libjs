import * as _ from "lodash";
import * as assert from "assert";
import * as utils from "./utils";
import parseAmount from "./amount";

function parseEscrowCreation(tx: any): Object {
  assert(tx.TransactionType === "EscrowCreate");

  return utils.removeUndefined({
    allowCancelAfter: utils.parseTimestamp(tx.CancelAfter),
    allowExecuteAfter: utils.parseTimestamp(tx.FinishAfter),
    amount: parseAmount(tx.Amount).value,
    condition: tx.Condition,
    destination: tx.Destination,
    destinationTag: tx.DestinationTag,
    memos: utils.parseMemos(tx),
    sourceTag: tx.SourceTag,
  });
}

export default parseEscrowCreation;
