import * as utils from "./utils";

export type Trustline = {
  account: string,
  limit: number,
  currency: string,
  quality_in: number | null,
  quality_out: number | null,
  no_casinocoin: boolean,
  freeze: boolean,
  authorized: boolean,
  limit_peer: string,
  no_casinocoin_peer: boolean,
  freeze_peer: boolean,
  peer_authorized: boolean,
  balance: any,
};

export type TrustlineSpecification = {};
export type TrustlineCounterParty = {};
export type TrustlineState = { balance: number };
export type AccountTrustline = {
  specification: TrustlineSpecification,
  counterparty: TrustlineCounterParty,
  state: TrustlineState,
};

// casinocoind 'account_lines' returns a different format for
// trustlines than 'tx'
function parseAccountTrustline(trustline: Trustline): AccountTrustline {
  const specification = utils.removeUndefined({
    authorized: trustline.authorized || undefined,
    counterparty: trustline.account,
    currency: trustline.currency,
    frozen: trustline.freeze || undefined,
    limit: trustline.limit,
    qualityIn: utils.parseQuality(trustline.quality_in) || undefined,
    qualityOut: utils.parseQuality(trustline.quality_out) || undefined,
    ripplingDisabled: trustline.no_casinocoin || undefined,
  });

  // casinocoind doesn't provide the counterparty's qualities
  const counterparty = utils.removeUndefined({
    authorized: trustline.peer_authorized || undefined,
    frozen: trustline.freeze_peer || undefined,
    limit: trustline.limit_peer,
    ripplingDisabled: trustline.no_casinocoin_peer || undefined,
  });

  const state = {
    balance: trustline.balance,
  };

  return { specification, counterparty, state };
}

export default parseAccountTrustline;
