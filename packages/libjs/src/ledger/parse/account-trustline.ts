import {parseQuality} from './utils'
import {removeUndefined} from '../../common'

type Trustline = {
  account: string, limit: number, currency: string, quality_in: number|null,
  quality_out: number|null, no_casinocoin: boolean, freeze: boolean,
  authorized: boolean, limit_peer: string, no_casinocoin_peer: boolean,
  freeze_peer: boolean, peer_authorized: boolean, balance: any
}

type TrustlineSpecification = {}
type TrustlineCounterParty = {}
type TrustlineState = {balance: number}
type AccountTrustline = {
  specification: TrustlineSpecification, counterparty: TrustlineCounterParty,
  state: TrustlineState
}

// casinocoind 'account_lines' returns a different format for
// trustlines than 'tx'
function parseAccountTrustline(trustline: Trustline): AccountTrustline {
  const specification = removeUndefined({
    limit: trustline.limit,
    currency: trustline.currency,
    counterparty: trustline.account,
    qualityIn: parseQuality(trustline.quality_in) || undefined,
    qualityOut: parseQuality(trustline.quality_out) || undefined,
    ripplingDisabled: trustline.no_casinocoin || undefined,
    frozen: trustline.freeze || undefined,
    authorized: trustline.authorized || undefined
  })
  // casinocoind doesn't provide the counterparty's qualities
  const counterparty = removeUndefined({
    limit: trustline.limit_peer,
    ripplingDisabled: trustline.no_casinocoin_peer || undefined,
    frozen: trustline.freeze_peer || undefined,
    authorized: trustline.peer_authorized || undefined
  })
  const state = {
    balance: trustline.balance
  }
  return {specification, counterparty, state}
}

export default parseAccountTrustline
