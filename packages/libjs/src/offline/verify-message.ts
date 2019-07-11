import * as keypairs from 'casinocoin-libjs-keypairs'

function hexToString(hex: string): string {
  return hex ? Buffer.from(hex, 'hex').toString('utf-8') : undefined
}

function convertStringToHex(inputString: string) {
  if (inputString !== undefined && inputString.length > 0) {
    return Buffer.from(inputString, 'utf8').toString('hex').toUpperCase()
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
