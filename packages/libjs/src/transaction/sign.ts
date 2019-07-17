import * as utils from './utils'
import * as keypairs from 'casinocoin-libjs-keypairs'
import * as binary from 'casinocoin-libjs-binary-codec'
import {computeBinaryTransactionHash} from 'casinocoin-libjs-hashes'
import {KeyPair} from './../common/types'
const validate = utils.common.validate

function computeSignature(tx: Object, privateKey: string, signAs?: string) {
  const signingData = signAs ?
    binary.encodeForMultisigning(tx, signAs) : binary.encodeForSigning(tx)
  return keypairs.sign(signingData, privateKey)
}

function signWithKeypair(
  txJSON: string,
  keypair: KeyPair,
  options: {signAs: ''}
): { signedTransaction: string; id: string } {
  validate.sign({txJSON, keypair})

  const tx = JSON.parse(txJSON)
  if (tx.TxnSignature || tx.Signers) {
    throw new utils.common.errors.ValidationError(
      'txJSON must not contain "TxnSignature" or "Signers" properties'
    )
  }

  tx.SigningPubKey = options.signAs ? '' : keypair.publicKey

  if (options.signAs) {
    const signer = {
      Account: options.signAs,
      SigningPubKey: keypair.publicKey,
      TxnSignature: computeSignature(tx, keypair.privateKey, options.signAs)
    }
    tx.Signers = [{Signer: signer}]
  } else {
    tx.TxnSignature = computeSignature(tx, keypair.privateKey)
  }

  const serialized = binary.encode(tx)
  return {
    signedTransaction: serialized,
    id: computeBinaryTransactionHash(serialized)
  }
}


function sign(
  txJSON: string,
  secret?: any,
  options?: {signAs: ''},
  keypair?: KeyPair
): { signedTransaction: string; id: string } {
  if (typeof secret === 'string') {
    // we can't validate that the secret matches the account because
    // the secret could correspond to the regular key
    validate.sign({txJSON, secret})
    return signWithKeypair(
      txJSON,
      keypairs.deriveKeypair(secret),
      options
    )
  } else {

    if (!keypair && !secret) {
      // Clearer message than 'ValidationError: instance is not exactly one from [subschema 0],[subschema 1]'
      throw new utils.common.errors.ValidationError(
        'sign: Missing secret or keypair.'
      )
    }

    return signWithKeypair(
      txJSON,
      keypair ? keypair : secret,
      options)
  }
}


export default sign
