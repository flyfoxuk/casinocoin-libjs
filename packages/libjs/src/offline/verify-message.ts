import * as keypairs from 'casinocoin-libjs-keypairs'

function hexToString(hex: string): string {
  return hex ? new Buffer(hex, 'hex').toString('utf-8') : undefined
}

function convertStringToHex(inputString: string) {
  if (inputString !== undefined && inputString.length > 0) {
    return new Buffer(inputString, 'utf8').toString('hex').toUpperCase()
  } else {
    return ''
  }
}

function verifyMessage(
  msg: string,
  signature: string,
  publicKey: string
): boolean {
  return keypairs.verifyMessage(convertStringToHex(msg), signature, publicKey)
}

export {
  verifyMessage,
  hexToString
}
