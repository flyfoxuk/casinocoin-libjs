import * as _ from "lodash";
import * as utils from "./utils";
import BigNumber from "bignumber.js";
import { Instructions, Prepare } from "./types";
import { TrustLineSpecification } from "../ledger/trustlines-types";

const validate = utils.common.validate;
const trustlineFlags = utils.common.txFlags.TrustSet;

function convertQuality(quality: any) {
  return (new BigNumber(quality)).shift(9).truncated().toNumber();
}

function createTrustlineTransaction(
  account: string,
  trustline: TrustLineSpecification,
): Object {
  const limit = {
    currency: trustline.currency,
    issuer: trustline.counterparty,
    value: trustline.limit,
  };

  const txJSON: any = {
    Account: account,
    Flags: 0,
    LimitAmount: limit,
    TransactionType: "TrustSet",
  };

  if (trustline.qualityIn !== undefined) {
    txJSON.QualityIn = convertQuality(trustline.qualityIn);
  }
  if (trustline.qualityOut !== undefined) {
    txJSON.QualityOut = convertQuality(trustline.qualityOut);
  }
  if (trustline.authorized === true) {
    txJSON.Flags |= trustlineFlags.SetAuth;
  }
  if (trustline.ripplingDisabled !== undefined) {
    txJSON.Flags |= trustline.ripplingDisabled ?
      trustlineFlags.NoCasinocoin : trustlineFlags.ClearNoCasinocoin;
  }
  if (trustline.frozen !== undefined) {
    txJSON.Flags |= trustline.frozen ?
      trustlineFlags.SetFreeze : trustlineFlags.ClearFreeze;
  }
  if (trustline.memos !== undefined) {
    txJSON.Memos = _.map(trustline.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareTrustline(
  address: string,
  trustline: TrustLineSpecification,
  instructions: Instructions = {},
): Promise<Prepare> {
  validate.prepareTrustline({ address, trustline, instructions });
  const txJSON = createTrustlineTransaction(address, trustline);
  return utils.prepareTransaction(txJSON, this, instructions);
}

export default prepareTrustline;
