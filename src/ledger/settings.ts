import * as _ from "lodash";
import * as utils from "./utils";
import parseFields from "./parse/fields";

const { validate } = utils.common;
const AccountFlags = utils.common.constants.AccountFlags;

type SettingsOptions = {
  ledgerVersion?: number,
};

type GetSettings = {
  passwordSpent?: boolean,
  requireDestinationTag?: boolean,
  requireAuthorization?: boolean,
  disallowIncomingCSC?: boolean,
  disableMasterKey?: boolean,
  enableTransactionIDTracking?: boolean,
  noFreeze?: boolean,
  globalFreeze?: boolean,
  defaultCasinocoin?: boolean,
  emailHash?: string|null,
  messageKey?: string,
  domain?: string,
  transferRate?: number|null,
  regularKey?: string,
};

function parseFlags(value: any) {
  const settings: any = {};
  for (const flagName in AccountFlags) {
    if (value & AccountFlags[flagName]) {
      settings[flagName] = true;
    }
  }
  return settings;
}

function formatSettings(response: any) {
  const data = response.account_data;
  const parsedFlags = parseFlags(data.Flags);
  const parsedFields = parseFields(data);
  return _.assign({}, parsedFlags, parsedFields);
}

function getSettings(address: string, options: SettingsOptions = {}): Promise<GetSettings> {
  validate.getSettings({ address, options });

  const request = {
    account: address,
    command: "account_info",
    ledger_index: options.ledgerVersion || "validated",
  };

  return this.connection.request(request).then(formatSettings);
}

export default getSettings;
