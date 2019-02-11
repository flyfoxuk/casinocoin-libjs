import * as _ from "lodash";
import * as utils from "./utils";

export type PaymentChannel = {
  Sequence: number,
  Account: string,
  Amount: string,
  Balance: string,
  PublicKey: number,
  Destination: string,
  SettleDelay: number,
  Expiration?: number,
  CancelAfter?: number,
  SourceTag?: number,
  DestinationTag?: number,
  OwnerNode: string,
  LedgerEntryType: string,
  PreviousTxnID: string,
  PreviousTxnLgrSeq: number,
  index: string,
};

export type LedgerEntryResponse = {
  node: PaymentChannel,
  ledger_current_index?: number,
  ledger_hash?: string,
  ledger_index: number,
  validated: boolean,
};

export type PaymentChannelResponse = {
    account: string,
    balance: string,
    publicKey: number,
    destination: string,
    settleDelay: number,
    expiration?: number,
    cancelAfter?: number,
    sourceTag?: number,
    destinationTag?: number,
    previousAffectingTransactionID: string,
    previousAffectingTransactionLedgerVersion: number,
};

function parsePaymentChannel(data: PaymentChannel): PaymentChannelResponse {
    return utils.removeUndefined({
        account: data.Account,
        amount: utils.dropsToCsc(data.Amount),
        balance: utils.dropsToCsc(data.Balance),
        cancelAfter: utils.parseTimestamp(data.CancelAfter),
        destination: data.Destination,
        destinationTag: data.DestinationTag,
        expiration: utils.parseTimestamp(data.Expiration),
        previousAffectingTransactionID: data.PreviousTxnID,
        previousAffectingTransactionLedgerVersion: data.PreviousTxnLgrSeq,
        publicKey: data.PublicKey,
        settleDelay: data.SettleDelay,
        sourceTag: data.SourceTag,
    });
}

export default parsePaymentChannel;
