import * as utils from "./utils";
import { txFlags } from "../common/txflags";

const kycFlags = txFlags.KYC;
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

type KYCInfoResponse = {
  account: number,
  verified: boolean,
  lastUpdated: number,
  scanReferences: string[],
};

function convertHexToUUID(hex: string) {
  return (
    hex.substr(0, 8) + "-" +
    hex.substr(8, 4) + "-" +
    hex.substr(12, 4) + "-" +
    hex.substr(16, 4) + "-" +
    hex.substr(20)).toLowerCase();
}

function formatAccountInfo(response: AccountDataResponse) {
  const data: AccountData = response.account_data;
  console.log("Account Data: " + JSON.stringify(data));
  const kycVerified = ((data.Flags & kycFlags.KYCSet) !== 0);
  if (kycVerified) {
    console.log("KYC Verified!");
    const verificationsArray: any = [];
    if (data.KYC.Verifications) {
      // convert items to UUID values
      data.KYC.Verifications.forEach((item: any) => {
        verificationsArray.push(convertHexToUUID(item));
      });
    }
    return removeUndefined({
      account: data.Account,
      lastUpdated: data.KYC.Date,
      verifications: verificationsArray,
      verified: kycVerified,
    });
  } else {
    console.log("NOT KYC Verified!");
    if (data.KYC) {
      return removeUndefined({
        account: data.Account,
        lastUpdated: data.KYC.Date,
        verifications: [],
        verified: kycVerified,
      });
    } else {
      return removeUndefined({
        account: data.Account,
        verified: kycVerified,
      });
    }
  }
}

function getKYCInfo(address: string, options: AccountInfoOptions = {}): Promise<KYCInfoResponse> {
  validate.getAccountInfo({ address, options });

  const request = {
    account: address,
    command: "account_info",
    ledger_index: options.ledgerVersion || "validated",
  };

  return this.connection.request(request).then(formatAccountInfo);
}

export default getKYCInfo;
