import * as _ from "lodash";
import * as utils from "./utils";
import { Instructions, Prepare } from "./types";
import { KYCSet } from "../ledger/transaction-types";

const { validate, iso8601ToCasinocoinTime } = utils.common;
const kycFlag = utils.common.txFlags.KYC;
const toCasinocoindAmount = utils.common.toCasinocoindAmount;

function createKYCSetTransaction(kyc: KYCSet): Object {
  // convert verifications to 32 byte hex if necessary
  const verifications: string[] = [];
  if (kyc.verifications) {
    kyc.verifications.forEach((element) => {
      if (element.indexOf("-") !== -1 && element.length === 36) {
        // remove dashes
        const hexUUID = element.replace(/-/g, "");
        verifications.push(hexUUID.toUpperCase());
      } else if (element.length === 32) {
        verifications.push(element.toUpperCase());
      } else {
        console.log("invalid UUID: " + element);
      }
    });
  }
  const txJSON: any = {
    Account: kyc.kycAccount,
    Destination: kyc.destination,
    TransactionType: "KYCSet",
    Verifications: verifications,
  };
  // set or clear KYC flag
  if (kyc.verified) {
    txJSON.SetFlag = 1;
  } else {
    txJSON.ClearFlag = 1;
  }
  return txJSON;
}

function prepareKYCSet(kyc: KYCSet): Promise<Prepare> {
  // validate.prepareKYCSet({ address, kyc, instructions })
  const txJSON = createKYCSetTransaction(kyc);
  return utils.prepareTransaction(txJSON, this, {});
}

export default prepareKYCSet;
