import * as utils from "./utils";
import parseLedger from "./parse/ledger";
import { GetLedger } from "./types";

const { validate } = utils.common;

type LedgerOptions = {
  ledgerVersion?: number,
  includeAllData?: boolean,
  includeTransactions?: boolean,
  includeState?: boolean,
};

function getLedger(options: LedgerOptions = {}): Promise<GetLedger> {
  validate.getLedger({ options });

  const request = {
    accounts: options.includeState,
    command: "ledger",
    expand: options.includeAllData,
    ledger_index: options.ledgerVersion || "validated",
    transactions: options.includeTransactions,
  };

  return this.connection.request(request).then((response: any) =>
    parseLedger(response.ledger));
}

export default getLedger;
