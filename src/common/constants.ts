import { txFlagIndices } from "./txflags";

const accountRootFlags = {
  DefaultCasinocoin: 0x00800000,
  DisableMaster: 0x00100000, // force regular key
  DisallowCSC: 0x00080000, // disallow sending CSC
  GlobalFreeze: 0x00400000, // trustlines globally frozen
  NoFreeze: 0x00200000, // permanently disallowed freezing trustlines
  PasswordSpent: 0x00010000, // password set fee is spent
  RequireAuth: 0x00040000, // require a authorization to hold IOUs
  RequireDestTag: 0x00020000, // require a DestinationTag for payments
};

const AccountFlags = {
  defaultCasinocoin: accountRootFlags.DefaultCasinocoin,
  disableMasterKey: accountRootFlags.DisableMaster,
  disallowIncomingCSC: accountRootFlags.DisallowCSC,
  globalFreeze: accountRootFlags.GlobalFreeze,
  noFreeze: accountRootFlags.NoFreeze,
  passwordSpent: accountRootFlags.PasswordSpent,
  requireAuthorization: accountRootFlags.RequireAuth,
  requireDestinationTag: accountRootFlags.RequireDestTag,
};

const AccountFlagIndices = {
  defaultCasinocoin: txFlagIndices.AccountSet.asfDefaultCasinocoin,
  disableMasterKey: txFlagIndices.AccountSet.asfDisableMaster,
  disallowIncomingCSC: txFlagIndices.AccountSet.asfDisallowCSC,
  enableTransactionIDTracking: txFlagIndices.AccountSet.asfAccountTxnID,
  globalFreeze: txFlagIndices.AccountSet.asfGlobalFreeze,
  noFreeze: txFlagIndices.AccountSet.asfNoFreeze,
  requireAuthorization: txFlagIndices.AccountSet.asfRequireAuth,
  requireDestinationTag: txFlagIndices.AccountSet.asfRequireDest,
};

const AccountFields = {
  Domain: { name: "domain", encoding: "hex" },
  EmailHash: {
    defaults: "0",
    encoding: "hex",
    length: 32,
    name: "emailHash",
  },
  MessageKey: { name: "messageKey" },
  TransferRate: { name: "transferRate", defaults: 0, shift: 9 },
};

export {
  AccountFields,
  AccountFlagIndices,
  AccountFlags,
};
