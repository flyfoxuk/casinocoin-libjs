import * as common from '../../common'
import {Amount, CasinocoindAmount} from '../../common/types'


function parseAmount(amount: CasinocoindAmount): Amount {
  if (typeof amount === 'string') {
    return {
      currency: 'CSC',
      value: common.dropsToCsc(amount)
    }
  }
  return {
    currency: amount.currency,
    value: amount.value,
    counterparty: amount.issuer
  }
}

export default parseAmount
