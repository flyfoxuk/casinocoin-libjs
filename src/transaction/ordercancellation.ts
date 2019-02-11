import * as _ from "lodash";
import * as utils from "./utils";
import { Instructions, Prepare } from "./types";

const validate = utils.common.validate;

function createOrderCancellationTransaction(
  account: string,
  orderCancellation: any,
): Object {
  const txJSON: any = {
    Account: account,
    OfferSequence: orderCancellation.orderSequence,
    TransactionType: "OfferCancel",
  };
  if (orderCancellation.memos !== undefined) {
    txJSON.Memos = _.map(orderCancellation.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareOrderCancellation(
  address: string,
  orderCancellation: Object,
  instructions: Instructions = {},
): Promise<Prepare> {
  validate.prepareOrderCancellation({ address, orderCancellation, instructions });
  const txJSON = createOrderCancellationTransaction(address, orderCancellation);
  return utils.prepareTransaction(txJSON, this, instructions);
}

export default prepareOrderCancellation;
