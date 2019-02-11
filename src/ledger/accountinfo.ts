import * as utils from "./utils";

const { validate, removeUndefined } = utils.common;

type AccountData = {
  Sequence: number,
  Account: string,
  Balance: string,
  Flags: number,
  LedgerEntryType: string,
  OwnerCount: number,
  PreviousTxnID: string,
  AccountTxnID?: string,
  PreviousTxnLgrSeq: number,
  index: string,
};

type AccountDataResponse = {
  account_data: AccountData,
  ledger_current_index?: number,
  ledger_hash?: string,
  ledger_index: number,
  validated: boolean,
};

type AccountInfoOptions = {
  ledgerVersion?: number,
};

type AccountInfoResponse = {
  sequence: number,
  cscBalance: string,
  ownerCount: number,
  previousInitiatedTransactionID: string,
  previousAffectingTransactionID: string,
  previousAffectingTransactionLedgerVersion: number,
};

function formatAccountInfo(response: AccountDataResponse) {
  const data = response.account_data;
  return removeUndefined({
    cscBalance: utils.common.dropsToCsc(data.Balance),
    ownerCount: data.OwnerCount,
    previousAffectingTransactionID: data.PreviousTxnID,
    previousAffectingTransactionLedgerVersion: data.PreviousTxnLgrSeq,
    previousInitiatedTransactionID: data.AccountTxnID,
    sequence: data.Sequence,
  });
}

function getAccountInfo(address: string, options: AccountInfoOptions = {}): Promise<AccountInfoResponse> {
  validate.getAccountInfo({ address, options });

  const request = {
    account: address,
    command: "account_info",
    ledger_index: options.ledgerVersion || "validated",
  };

  return this.connection.request(request).then(formatAccountInfo);
}

export default getAccountInfo;
