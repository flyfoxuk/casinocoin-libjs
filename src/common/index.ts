import * as connection_ from "./connection";
import * as constants_ from "./constants";
import * as errors_ from "./errors";
import * as serverInfo_ from "./serverinfo";
import * as txFlags_ from "./txflags";
import * as utils from "./utils";
import * as validate_ from "./validate";

export const Connection = connection_;

export const constants = constants_;

export const errors = errors_;

export const validate = validate_;

export const txFlags = txFlags_;

export const serverInfo = serverInfo_;

export const dropsToCsc = utils.dropsToCsc;

export const cscToDrops = utils.cscToDrops;

export const toCasinocoindAmount = utils.toCasinocoindAmount;

//     //generateAddress: utils.generateAddress,
//     //generateAddressAPI: utils.generateAddressAPI,

export const removeUndefined = utils.removeUndefined;

export const convertKeysFromSnakeCaseToCamelCase = utils.convertKeysFromSnakeCaseToCamelCase;

export const iso8601ToCasinocoinTime = utils.iso8601ToCasinocoinTime;

export const casinocoinTimeToISO8601 = utils.casinocoinTimeToISO8601;

export const isValidSecret = utils.isValidSecret;
