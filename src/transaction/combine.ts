import * as _ from "lodash";
import binary from "casinocoin-libjs-binary-codec";
import * as utils from "./utils";
import BigNumber from "bignumber.js";
import { decodeAddress } from "casinocoin-libjs-address-codec";
import { computeBinaryTransactionHash } from "casinocoin-libjs-hashes";

const { validate } = utils.common;

function addressToBigNumber(address: any) {
  const hex = (new Buffer(decodeAddress(address))).toString("hex");
  return new BigNumber(hex, 16);
}

function compareSigners(a: any, b: any) {
  return addressToBigNumber(a.Signer.Account)
    .comparedTo(addressToBigNumber(b.Signer.Account));
}

function combine(signedTransactions: string[]): Object {
  validate.combine({ signedTransactions });

  // TODO: signedTransactions is an array of strings in the documentation, but
  // tests and this code handle it as an array of objects. Fix!
  const txs: any[] = _.map(signedTransactions, binary.decode);
  const tx = _.omit(txs[0], "Signers");
  if (!_.every(txs, (localScopeTx) => _.isEqual(tx, _.omit(localScopeTx, "Signers")))) {
    throw new utils.common.errors.ValidationError(
      "txJSON is not the same for all signedTransactions");
  }
  const unsortedSigners = _.reduce(txs, (accumulator, localScopeTx) =>
    accumulator.concat(localScopeTx.Signers || []), []);
  const signers = unsortedSigners.sort(compareSigners);
  const signedTx = _.assign({}, tx, { Signers: signers });
  const signedTransaction = binary.encode(signedTx);
  const id = computeBinaryTransactionHash(signedTransaction);
  return { signedTransaction, id };
}

export default combine;
