import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";

function getUserHomePath(): any {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function loadWallet() {
  const secretPath = path.join(getUserHomePath(), ".casinocoin_wallet");
  try {
    const walletRaw = fs.readFileSync(secretPath, { encoding: "utf8" }).trim();
    return JSON.parse(walletRaw);
  } catch (e) {
    return null;
  }
}

const WALLET = loadWallet();

function getTestKey(key: string): any {
  if (process.env.TEST_ADDRESS && process.env.TEST_SECRET) {
    if (key === "address") {
      return process.env.TEST_ADDRESS;
    }
    if (key === "secret") {
      return process.env.TEST_SECRET;
    }
  }
  if (WALLET === null) {
    throw new Error("Could not find .casinocoin_wallet file in home directory");
  }
  if (WALLET.test === undefined) {
    throw new Error("Wallet does not contain a 'test' account");
  }
  return WALLET.test[key];
}

export default {
  getAddress: _.partial(getTestKey, "address"),
  getSecret: _.partial(getTestKey, "secret"),
};
