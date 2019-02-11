import * as utils from "./utils";
import { Instructions, Prepare } from "./types";

const { validate, iso8601ToCasinocoinTime, cscToDrops } = utils.common;

type PaymentChannelCreate = {
  amount: string,
  destination: string,
  settleDelay: number,
  publicKey: string,
  cancelAfter?: string,
  sourceTag?: number,
  destinationTag?: number,
};

function createPaymentChannelCreateTransaction(
  account: string,
  paymentChannel: PaymentChannelCreate,
): Object {
  const txJSON: any = {
    Account: account,
    Amount: cscToDrops(paymentChannel.amount),
    Destination: paymentChannel.destination,
    PublicKey: paymentChannel.publicKey.toUpperCase(),
    SettleDelay: paymentChannel.settleDelay,
    TransactionType: "PaymentChannelCreate",
  };

  if (paymentChannel.cancelAfter !== undefined) {
    txJSON.CancelAfter = iso8601ToCasinocoinTime(paymentChannel.cancelAfter);
  }
  if (paymentChannel.sourceTag !== undefined) {
    txJSON.SourceTag = paymentChannel.sourceTag;
  }
  if (paymentChannel.destinationTag !== undefined) {
    txJSON.DestinationTag = paymentChannel.destinationTag;
  }

  return txJSON;
}

function preparePaymentChannelCreate(
  address: string,
  paymentChannelCreate: PaymentChannelCreate,
  instructions: Instructions = {},
): Promise<Prepare> {
  validate.preparePaymentChannelCreate({ address, paymentChannelCreate, instructions });
  const txJSON = createPaymentChannelCreateTransaction(
    address, paymentChannelCreate);
  return utils.prepareTransaction(txJSON, this, instructions);
}

export default preparePaymentChannelCreate;
