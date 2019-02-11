import * as _ from "lodash";
import * as utils from "./utils";
import { Amount } from "../common/types.js";

const { validate } = utils.common;

type BalanceSheetOptions = {
  excludeAddresses?: string[],
  ledgerVersion?: number,
};

type GetBalanceSheet = {
  balances?: Amount[],
  assets?: Amount[],
  obligations?: Array<{
    currency: string,
    value: string,
  }>,
};

function formatBalanceSheet(balanceSheet: any): GetBalanceSheet {
  const result: GetBalanceSheet = {};

  if (!_.isUndefined(balanceSheet.balances)) {
    result.balances = [];
    _.forEach(balanceSheet.balances, (balances: any, counterparty: any) => {
      _.forEach(balances, (balance: any) => {
        if (result.balances) {
          result.balances.push(_.assign({counterparty}, balance));
        }
      });
    });
  }
  if (!_.isUndefined(balanceSheet.assets)) {
    result.assets = [];
    _.forEach(balanceSheet.assets, (assets: any, counterparty: any) => {
      _.forEach(assets, (balance: any) => {
        if (result.assets) {
          result.assets.push(_.assign({}, { counterparty }, balance));
        }
      });
    });
  }
  if (!_.isUndefined(balanceSheet.obligations)) {
    result.obligations = _.map(
      balanceSheet.obligations as { [key: string]: string },
      (value: any, currency: any) =>
        ({ currency, value }),
    );
  }

  return result;
}

function getBalanceSheet(
  address: string,
  options: BalanceSheetOptions = {},
): Promise<GetBalanceSheet> {
  validate.getBalanceSheet({ address, options });

  return utils.ensureLedgerVersion.call(this, options).then((ledgerOptions: any) => {
    const request = {
      account: address,
      command: "gateway_balances",
      hotwallet: ledgerOptions.excludeAddresses,
      ledger_index: ledgerOptions.ledgerVersion,
      strict: true,
    };

    return this.connection.request(request).then(formatBalanceSheet);
  });
}

export default getBalanceSheet;
