import * as _ from "lodash";
import BigNumber from "bignumber.js";
import { deriveKeypair } from "casinocoin-libjs-keypairs";
import { Amount, CasinocoindAmount } from "./types.js";

function isValidSecret(secret: string): boolean {
  try {
    deriveKeypair(secret);
    return true;
  } catch (err) {
    return false;
  }
}

function dropsToCsc(drops: string): string {
  return (new BigNumber(drops)).dividedBy(100000000.0).toString();
}

function cscToDrops(csc: string): string {
  const cscDrops = (new BigNumber(csc)).times(100000000.0);
  return cscDrops.floor().toString();
}

function toCasinocoindAmount(amount: Amount): CasinocoindAmount {
  if (amount.currency === "CSC") {
    const cscDrops = cscToDrops(amount.value);
    return cscDrops;
  }
  const defaultObject = {
    currency: amount.currency,
    issuer: amount.counterparty ? amount.counterparty :
      (amount.issuer ? amount.issuer : undefined),
    value: amount.value,
  };
  return defaultObject;
}

function convertKeysFromSnakeCaseToCamelCase(obj: any): any {
  if (typeof obj === "object") {
    let newKey;
    return _.reduce(obj, (result: any, value: any, key: any) => {
      newKey = key;
      // taking this out of function leads to error in PhantomJS
      const FINDSNAKE = /([a-zA-Z]_[a-zA-Z])/g;
      if (FINDSNAKE.test(key)) {
        newKey = key.replace(FINDSNAKE, (r: any) => r[0] + r[2].toUpperCase());
      }
      result[newKey] = convertKeysFromSnakeCaseToCamelCase(value);
      return result;
    }, {});
  }
  return obj;
}

function removeUndefined<T extends object>(obj: T): T {
  return _.omit(obj, _.isUndefined) as T;
}

/**
 * @param {Number} rpepoch (seconds since 1/1/2000 GMT)
 * @return {Number} ms since unix epoch
 *
 */
function casinocoinToUnixTimestamp(rpepoch: number): number {
  return (rpepoch + 0x386D4380) * 1000;
}

/**
 * @param {Number|Date} timestamp (ms since unix epoch)
 * @return {Number} seconds since casinocoin epoch ( 1/1/2000 GMT)
 */
function unixToCasinocoinTimestamp(timestamp: number): number {
  return Math.round(timestamp / 1000) - 0x386D4380;
}

function casinocoinTimeToISO8601(casinocoinTime: number): string {
  return new Date(casinocoinToUnixTimestamp(casinocoinTime)).toISOString();
}

function iso8601ToCasinocoinTime(iso8601: string): number {
  return unixToCasinocoinTimestamp(Date.parse(iso8601));
}

export {
  dropsToCsc,
  cscToDrops,
  toCasinocoindAmount,
  convertKeysFromSnakeCaseToCamelCase,
  removeUndefined,
  casinocoinTimeToISO8601,
  iso8601ToCasinocoinTime,
  isValidSecret,
};
