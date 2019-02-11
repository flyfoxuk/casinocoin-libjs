import * as assert from "assert";
import * as utils from "./utils";

const flags = utils.txFlags.TrustSet;

function parseFlag(flagsValue: any, trueValue: any, falseValue: any) {
  if (flagsValue & trueValue) {
    return true;
  }
  if (flagsValue & falseValue) {
    return false;
  }
  return undefined;
}

function parseTrustline(tx: any): Object {
  assert(tx.TransactionType === "TrustSet");

  return utils.removeUndefined({
    authorized: parseFlag(tx.Flags, flags.SetAuth, 0),
    counterparty: tx.LimitAmount.issuer,
    currency: tx.LimitAmount.currency,
    frozen: parseFlag(tx.Flags, flags.SetFreeze, flags.ClearFreeze),
    limit: tx.LimitAmount.value,
    qualityIn: utils.parseQuality(tx.QualityIn),
    qualityOut: utils.parseQuality(tx.QualityOut),
    ripplingDisabled: parseFlag(
      tx.Flags, flags.SetNoCasinocoin, flags.ClearNoCasinocoin),
  });
}

export default parseTrustline;
