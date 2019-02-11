import * as _ from "lodash";
import BigNumber from "bignumber.js";
/* const AccountFields = require("./utils").constants.AccountFields; */
import { AccountFields } from "./utils";

function parseField(info: any, value: any) {
  if (info.encoding === "hex" && !info.length) { // e.g. "domain"
    return new Buffer(value, "hex").toString("ascii");
  }
  if (info.shift) {
    return (new BigNumber(value)).shift(-info.shift).toNumber();
  }
  return value;
}

function parseFields(data: any): Object {
  const settings: any = {};
  for (const fieldName in AccountFields) {
    if (data[fieldName] !== undefined) {
      const info = AccountFields[fieldName];
      settings[info.name] = parseField(info, data[fieldName]);
    }
  }

  if (data.RegularKey) {
    settings.regularKey = data.RegularKey;
  }

  // TODO: this isn"t implemented in casinocoind yet, may have to change this later
  if (data.SignerQuorum || data.SignerEntries) {
    settings.signers = {};
    if (data.SignerQuorum) {
      settings.signers.threshold = data.SignerQuorum;
    }
    if (data.SignerEntries) {
      settings.signers.weights = _.map(data.SignerEntries, (entry: any) => {
        return {
          address: entry.SignerEntry.Account,
          weight: entry.SignerEntry.SignerWeight,
        };
      });
    }
  }
  return settings;
}

export default parseFields;
