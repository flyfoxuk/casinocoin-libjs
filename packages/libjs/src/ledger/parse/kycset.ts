import * as assert from 'assert'
import {removeUndefined} from '../../common'
// const flags = txFlags.KYC

// function parseFlag(flagsValue, trueValue, falseValue) {
//   if (flagsValue & trueValue) {
//     return true
//   }
//   if (flagsValue & falseValue) {
//     return false
//   }
//   return undefined
// }

function parseKYCSet(tx: any): Object {
  assert(tx.TransactionType === 'KYCSet')
  // console.log('parseKYCSet: ' + JSON.stringify(tx))
  return removeUndefined({
    KYC: []
  })
}

export default parseKYCSet
