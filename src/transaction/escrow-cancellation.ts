import * as _ from "lodash";
import * as utils from "./utils";
import { Instructions, Prepare } from "./types";
import { Memo } from "../common/types";

const validate = utils.common.validate;

type EscrowCancellation = {
  owner: string,
  escrowSequence: number,
  memos?: Memo[],
};

function createEscrowCancellationTransaction(
  account: string,
  payment: EscrowCancellation,
): Object {
  const txJSON: any = {
    Account: account,
    OfferSequence: payment.escrowSequence,
    Owner: payment.owner,
    TransactionType: "EscrowCancel",
  };
  if (payment.memos !== undefined) {
    txJSON.Memos = _.map(payment.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareEscrowCancellation(
  address: string,
  escrowCancellation: EscrowCancellation,
  instructions: Instructions = {},
): Promise<Prepare> {
  validate.prepareEscrowCancellation(
    { address, escrowCancellation, instructions });
  const txJSON = createEscrowCancellationTransaction(
    address, escrowCancellation);
  return utils.prepareTransaction(txJSON, this, instructions);
}

export default prepareEscrowCancellation;
