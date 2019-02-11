import * as assert from "assert";
import * as utils from "./utils";
import parsePayment from "./payment";
import parseTrustline from "./trustline";
import parseOrder from "./order";
import parseOrderCancellation from "./cancellation";
import parseSettings from "./settings";
import parseEscrowCreation from "./escrow-creation";
import parseEscrowExecution from "./escrow-execution";
import parseEscrowCancellation from "./escrow-cancellation";
import parsePaymentChannelCreate from "./payment-channel-create";
import parsePaymentChannelFund from "./payment-channel-fund";
import parsePaymentChannelClaim from "./payment-channel-claim";
import parseFeeUpdate from "./fee-update";
import parseAmendment from "./amendment";

function parseTransactionType(type: any) {
  const mapping: any = {
    AccountSet: "settings",
    EnableAmendment: "amendment",  // pseudo-transaction
    EscrowCancel: "escrowCancellation",
    EscrowCreate: "escrowCreation",
    EscrowFinish: "escrowExecution",
    OfferCancel: "orderCancellation",
    OfferCreate: "order",

    Payment: "payment",
    PaymentChannelClaim: "paymentChannelClaim",
    PaymentChannelCreate: "paymentChannelCreate",
    PaymentChannelFund: "paymentChannelFund",
    SetFee: "feeUpdate",          // pseudo-transaction
    SetRegularKey: "settings",
    SignerListSet: "settings",
    TrustSet: "trustline",
  };
  return mapping[type] || null;
}

function parseTransaction(tx: any): Object {
  const type = parseTransactionType(tx.TransactionType);
  const mapping = {
    amendment: parseAmendment,
    escrowCancellation: parseEscrowCancellation,
    escrowCreation: parseEscrowCreation,
    escrowExecution: parseEscrowExecution,
    feeUpdate: parseFeeUpdate,
    order: parseOrder,
    orderCancellation: parseOrderCancellation,
    payment: parsePayment,
    paymentChannelClaim: parsePaymentChannelClaim,
    paymentChannelCreate: parsePaymentChannelCreate,
    paymentChannelFund: parsePaymentChannelFund,
    settings: parseSettings,
    trustline: parseTrustline,
  };

  const parser: Function = mapping[type];
  assert(parser !== undefined, "Unrecognized transaction type");
  const specification = parser(tx);
  const outcome = utils.parseOutcome(tx);
  return utils.removeUndefined({
    address: tx.Account,
    id: tx.hash,
    outcome: outcome ? utils.removeUndefined(outcome) : undefined,
    sequence: tx.Sequence,
    specification: utils.removeUndefined(specification),
    type,
  });
}

export default parseTransaction;
