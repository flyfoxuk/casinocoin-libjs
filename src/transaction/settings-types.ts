type SettingPasswordSpent = {
  passwordSpent?: boolean,
};
type SettingRequireDestinationTag = {
  requireDestinationTag?: boolean,
};
type SettingRequireAuthorization = {
  requireAuthorization?: boolean,
};
type SettingDisallowIncomingCSC = {
  disallowIncomingCSC?: boolean,
};
type SettingDisableMasterKey = {
  disableMasterKey?: boolean,
};
type SettingEnableTransactionIDTracking = {
  enableTransactionIDTracking?: boolean,
};
type SettingNoFreeze = {
  noFreeze?: boolean,
};
type SettingGlobalFreeze = {
  globalFreeze?: boolean,
};
type SettingDefaultCasinocoin = {
  defaultCasinocoin?: boolean,
};
type SettingEmailHash = {
  emailHash?: string,
};
type SettingMessageKey = {
  messageKey?: string,
};
type SettingDomain = {
  domain?: string,
};
type SettingTransferRate = {
  transferRate?: number,
};
type SettingRegularKey = {
  regularKey?: string,
};

export type Settings = SettingRegularKey |
  SettingTransferRate | SettingDomain | SettingMessageKey |
  SettingEmailHash | SettingDefaultCasinocoin |
  SettingGlobalFreeze | SettingNoFreeze | SettingEnableTransactionIDTracking |
  SettingDisableMasterKey | SettingDisallowIncomingCSC |
  SettingRequireAuthorization | SettingRequireDestinationTag |
  SettingPasswordSpent;
