const txFlags = {
  // Universal flags can apply to any transaction type
  Universal: {
    FullyCanonicalSig: 0x80000000,
  },

  AccountSet: {
    AllowCSC: 0x00200000,
    DisallowCSC: 0x00100000,
    OptionalAuth: 0x00080000,
    OptionalDestTag: 0x00020000,
    RequireAuth: 0x00040000,
    RequireDestTag: 0x00010000,
  },

  TrustSet: {
    ClearFreeze: 0x00200000,
    ClearNoCasinocoin: 0x00040000,
    NoCasinocoin: 0x00020000,
    SetAuth: 0x00010000,
    SetFreeze: 0x00100000,
    SetNoCasinocoin: 0x00020000,
  },

  OfferCreate: {
    FillOrKill: 0x00040000,
    ImmediateOrCancel: 0x00020000,
    Passive: 0x00010000,
    Sell: 0x00080000,
  },

  Payment: {
    LimitQuality: 0x00040000,
    NoCasinocoinDirect: 0x00010000,
    PartialPayment: 0x00020000,
  },

  PaymentChannelClaim: {
    Close: 0x00020000,
    Renew: 0x00010000,
  },

  KYC: {
    KYCSet: 0x1000000,
  },
};

// The following are integer (as opposed to bit) flags
// that can be set for particular transactions in the
// SetFlag or ClearFlag field
const txFlagIndices = {
  AccountSet: {
    asfAccountTxnID: 5,
    asfDefaultCasinocoin: 8,
    asfDisableMaster: 4,
    asfDisallowCSC: 3,
    asfGlobalFreeze: 7,
    asfNoFreeze: 6,
    asfRequireAuth: 2,
    asfRequireDest: 1,
  },
};

export {
  txFlags,
  txFlagIndices,
};
