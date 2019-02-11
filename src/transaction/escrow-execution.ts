import * as _ from "lodash";
import * as utils from "./utils";
import { Instructions, Prepare } from "./types";
import { Memo } from "../common/types";

const validate = utils.common.validate;
const ValidationError = utils.common.errors.ValidationError;

type EscrowExecution = {
  owner: string,
  escrowSequence: number,
  memos?: Memo[],
  condition?: string,
  fulfillment?: string,
};

function createEscrowExecutionTransaction(
  account: string,
  payment: EscrowExecution,
): Object {
  const txJSON: any = {
    Account: account,
    OfferSequence: payment.escrowSequence,
    Owner: payment.owner,
    TransactionType: "EscrowFinish",
  };

  if (Boolean(payment.condition) !== Boolean(payment.fulfillment)) {
    throw new ValidationError("'condition' and 'fulfillment' fields on"
      + " EscrowFinish must only be specified together.");
  }

  if (payment.condition !== undefined) {
    txJSON.Condition = payment.condition;
  }
  if (payment.fulfillment !== undefined) {
    txJSON.Fulfillment = payment.fulfillment;
  }
  if (payment.memos !== undefined) {
    txJSON.Memos = _.map(payment.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareEscrowExecution(
  address: string,
  escrowExecution: EscrowExecution,
  instructions: Instructions = {},
): Promise<Prepare> {
  validate.prepareEscrowExecution(
    { address, escrowExecution, instructions });
  const txJSON = createEscrowExecutionTransaction(
    address, escrowExecution);
  return utils.prepareTransaction(txJSON, this, instructions);
}

export default prepareEscrowExecution;
