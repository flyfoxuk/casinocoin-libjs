import * as _ from "lodash";
import BigNumber from "bignumber.js";
import * as common from "../common";
import { Memo, ApiMemo } from "../common/types";
import { binary } from "casinocoin-libjs-binary-codec";
import { Instructions, Prepare } from "./types";
import { CasinoCoinAPI } from "../api";

const txFlags = common.txFlags;

function formatPrepareResponse(txJSON: any): Prepare {
  const instructions = {
    fee: common.dropsToCsc(txJSON.Fee),
    maxLedgerVersion: (txJSON.LastLedgerSequence === undefined ?
      null : txJSON.LastLedgerSequence),
    sequence: txJSON.Sequence,
  };
  return {
    instructions,
    txJSON: JSON.stringify(txJSON),
  };
}

function setCanonicalFlag(txJSON: any) {
  txJSON.Flags |= txFlags.Universal.FullyCanonicalSig;

  // JavaScript converts operands to 32-bit signed ints before doing bitwise
  // operations. We need to convert it back to an unsigned int.
  txJSON.Flags = txJSON.Flags >>> 0;
}

function scaleValue(value: any, multiplier: any, extra: number = 0) {
  return (new BigNumber(value)).times(multiplier).plus(extra).toString();
}

function prepareTransaction(
  txJSON: any,
  api: CasinoCoinAPI,
  instructions: Instructions,
): Promise<Prepare> {
  common.validate.instructions(instructions);
  const account = txJSON.Account;
  setCanonicalFlag(txJSON);

  function prepareMaxLedgerVersion(): Promise<Object> {
    if (instructions.maxLedgerVersion !== undefined) {
      if (instructions.maxLedgerVersion !== null) {
        txJSON.LastLedgerSequence = instructions.maxLedgerVersion;
      }
      return Promise.resolve(txJSON);
    }
    const offset = instructions.maxLedgerVersionOffset !== undefined ?
      instructions.maxLedgerVersionOffset : 3;
    return api.connection.getLedgerVersion().then((ledgerVersion: any) => {
      txJSON.LastLedgerSequence = ledgerVersion + offset;
      return txJSON;
    });
  }

  function prepareFee(): Promise<Object> {
    const multiplier = instructions.signersCount === undefined ? 1 : instructions.signersCount + 1;
    if (instructions.fee !== undefined) {
      txJSON.Fee = scaleValue(common.cscToDrops(instructions.fee), multiplier);
      return Promise.resolve(txJSON);
    }
    const cushion = api._feeCushion;
    return common.serverInfo.getFee(api.connection, cushion).then((fee: any) => {
      return api.connection.getFeeRef().then((feeRef: any) => {
        const extraFee =
          (txJSON.TransactionType !== "EscrowFinish" ||
            txJSON.Fulfillment === undefined) ? 0 :
            (cushion * feeRef * (32 + Math.floor(
              new Buffer(txJSON.Fulfillment, "hex").length / 16)));
        const feeDrops = common.cscToDrops(fee);
        if (instructions.maxFee !== undefined) {
          const maxFeeDrops = common.cscToDrops(instructions.maxFee);
          const normalFee = scaleValue(feeDrops, multiplier, extraFee);
          txJSON.Fee = BigNumber.min(normalFee, maxFeeDrops).toString();
        } else {
          txJSON.Fee = scaleValue(feeDrops, multiplier, extraFee);
        }
        return txJSON;
      });
    });
  }

  function prepareSequence(): Promise<Object> {
    if (instructions.sequence !== undefined) {
      txJSON.Sequence = instructions.sequence;
      return Promise.resolve(txJSON);
    }
    const request = {
      account,
      command: "account_info",
    };
    return api.connection.request(request).then((response: any) => {
      txJSON.Sequence = response.account_data.Sequence;
      return txJSON;
    });
  }

  return Promise.all([
    prepareMaxLedgerVersion(),
    prepareFee(),
    prepareSequence(),
  ]).then(() => formatPrepareResponse(txJSON));
}

function convertStringToHex(plainTxt: string) {
  return plainTxt ? (new Buffer(plainTxt, "utf8")).toString("hex").toUpperCase() :
    undefined;
}

function convertMemo(memo: Memo): { Memo: ApiMemo } | undefined {
  return {
    Memo: common.removeUndefined({
      MemoData: memo.data ? convertStringToHex(memo.data) : undefined,
      MemoFormat: memo.format ? convertStringToHex(memo.format) : undefined,
      MemoType: memo.type ? convertStringToHex(memo.type) : undefined,
    }),
  };
}

export {
  common,
  convertMemo,
  convertStringToHex,
  prepareTransaction,
};
