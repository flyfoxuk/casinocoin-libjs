import * as _ from "lodash";
import * as utils from "./utils";
import { Instructions, Prepare } from "./types";
import {
  Amount,
  Adjustment,
  MaxAdjustment,
  MinAdjustment,
  Memo,
} from "../common/types";

const validate = utils.common.validate;
const toCasinocoindAmount = utils.common.toCasinocoindAmount;
const paymentFlags = utils.common.txFlags.Payment;
const ValidationError = utils.common.errors.ValidationError;

type Payment = {
  source: Adjustment & MaxAdjustment, // bad practice!
  destination: Adjustment & MinAdjustment, // bad practice!
  paths?: string,
  memos?: Memo[],
  // A 256-bit hash that can be used to identify a particular payment
  invoiceID?: string,
  // A boolean that, if set to true, indicates that this payment should go
  // through even if the whole amount cannot be delivered because of a lack of
  // liquidity or funds in the source_account account
  allowPartialPayment?: boolean,
  // A boolean that can be set to true if paths are specified and the sender
  // would like the Casinocoin Network to disregard any direct paths from
  // the source_account to the destination_account. This may be used to take
  // advantage of an arbitrage opportunity or by gateways wishing to issue
  // balances from a hot wallet to a user who has mistakenly set a trustline
  // directly to the hot wallet
  noDirectCasinocoin?: boolean,
  limitQuality?: boolean,
};

function isCSCToCSCPayment(payment: Payment): boolean {
  const sourceCurrency = _.get(payment, "source.maxAmount.currency",
    _.get(payment, "source.amount.currency"));
  const destinationCurrency = _.get(payment, "destination.amount.currency",
    _.get(payment, "destination.minAmount.currency"));
  return sourceCurrency === "CSC" && destinationCurrency === "CSC";
}

function isIOUWithoutCounterparty(amount: Amount): boolean {
  return amount && amount.currency !== "CSC" &&
    amount.counterparty === undefined;
}

function applyAnyCounterpartyEncoding(payment: Payment): void {
  // Convert blank counterparty to sender or receiver"s address
  //   (Casinocoin convention for "any counterparty")
  // https://casinocoin.com/build/transactions/
  //    #special-issuer-values-for-sendmax-and-amount
  // https://casinocoin.com/build/casinocoin-rest/#counterparties-in-payments
  _.forEach([payment.source, payment.destination], (adjustment: any) => {
    _.forEach(["amount", "minAmount", "maxAmount"], (key) => {
      if (isIOUWithoutCounterparty(adjustment[key])) {
        adjustment[key].counterparty = adjustment.address;
      }
    });
  });
}

function createMaximalAmount(amount: Amount): Amount {
  const maxCSCValue = "40000000000";
  const maxIOUValue = "9999999999999999e80";
  const maxValue = amount.currency === "CSC" ? maxCSCValue : maxIOUValue;
  return _.assign({}, amount, { value: maxValue });
}

function createPaymentTransaction(address: string, paymentArgument: Payment): Object {
  const payment = _.cloneDeep(paymentArgument);
  applyAnyCounterpartyEncoding(payment);

  if (address !== payment.source.address) {
    throw new ValidationError("address must match payment.source.address");
  }

  if ((payment.source.maxAmount && payment.destination.minAmount) ||
    (payment.source.amount && payment.destination.amount)) {
    throw new ValidationError("payment must specify either (source.maxAmount " +
      "and destination.amount) or (source.amount and destination.minAmount)");
  }

  // when using destination.minAmount, casinocoind still requires that we set
  // a destination amount in addition to DeliverMin. the destination amount
  // is interpreted as the maximum amount to send. we want to be sure to
  // send the whole source amount, so we set the destination amount to the
  // maximum possible amount. otherwise it"s possible that the destination
  // cap could be hit before the source cap.
  const amount = payment.destination.minAmount && !isCSCToCSCPayment(payment) ?
    createMaximalAmount(payment.destination.minAmount) :
    (payment.destination.amount || payment.destination.minAmount);

  const txJSON: any = {
    Account: payment.source.address,
    Amount: toCasinocoindAmount(amount),
    Destination: payment.destination.address,
    Flags: 0,
    TransactionType: "Payment",
  };

  if (payment.invoiceID !== undefined) {
    txJSON.InvoiceID = payment.invoiceID;
  }
  if (payment.source.tag !== undefined) {
    txJSON.SourceTag = payment.source.tag;
  }
  if (payment.destination.tag !== undefined) {
    txJSON.DestinationTag = payment.destination.tag;
  }
  if (payment.memos !== undefined) {
    txJSON.Memos = _.map(payment.memos, utils.convertMemo);
  }
  if (payment.noDirectCasinocoin === true) {
    txJSON.Flags |= paymentFlags.NoCasinocoinDirect;
  }
  if (payment.limitQuality === true) {
    txJSON.Flags |= paymentFlags.LimitQuality;
  }
  if (!isCSCToCSCPayment(payment)) {
    // Don"t set SendMax for CSC->CSC payment
    // temREDUNDANT_SEND_MAX removed in:
    // https://github.com/casinocoin/casinocoind/commit/
    //  c522ffa6db2648f1d8a987843e7feabf1a0b7de8/
    if (payment.allowPartialPayment === true ||
      payment.destination.minAmount !== undefined) {
      txJSON.Flags |= paymentFlags.PartialPayment;
    }

    txJSON.SendMax = toCasinocoindAmount(
      payment.source.maxAmount || payment.source.amount);

    if (payment.destination.minAmount !== undefined) {
      txJSON.DeliverMin = toCasinocoindAmount(payment.destination.minAmount);
    }

    if (payment.paths !== undefined) {
      txJSON.Paths = JSON.parse(payment.paths);
    }
  } else if (payment.allowPartialPayment === true) {
    throw new ValidationError("CSC to CSC payments cannot be partial payments");
  }

  return txJSON;
}

function preparePayment(
  address: string,
  payment: Payment,
  instructions: Instructions = {},
): Promise<Prepare> {
  validate.preparePayment({ address, payment, instructions });
  const txJSON = createPaymentTransaction(address, payment);
  return utils.prepareTransaction(txJSON, this, instructions);
}

export default preparePayment;
