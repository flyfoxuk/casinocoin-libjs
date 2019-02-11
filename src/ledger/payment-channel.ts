import * as _ from "lodash";
import * as utils from "./utils";
import parsePaymentChannel, {
  LedgerEntryResponse,
  PaymentChannel,
} from "./parse/payment-channel";

const { validate, removeUndefined } = utils.common;
const NotFoundError = utils.common.errors.NotFoundError;

function formatResponse(response: LedgerEntryResponse) {
  if (response.node !== undefined &&
    response.node.LedgerEntryType === "PayChannel") {
    return parsePaymentChannel(response.node);
  } else {
    throw new NotFoundError("Payment channel ledger entry not found");
  }
}

function getPaymentChannel(id: string): Promise<PaymentChannelResponse> {
  validate.getPaymentChannel({ id });

  const request = {
    binary: false,
    command: "ledger_entry",
    index: id,
    ledger_index: "validated",
  };

  return this.connection.request(request).then(_.partial(formatResponse));
}

export default getPaymentChannel;
