import * as _ from "lodash";
import * as utils from "./utils";
import parseAccountTrustline from "./parse/account-trustline";
import { Connection } from "../common/connection";
import { TrustlinesOptions, Trustline } from "./trustlines-types";

const {validate} = utils.common;

type GetTrustlinesResponse = Trustline[];

interface IGetAccountLinesResponse {
  marker?: any;
  results: Trustline[];
}

function currencyFilter(currency: string, trustline: Trustline) {
  return currency === null || trustline.specification.currency === currency;
}

function formatResponse(options: TrustlinesOptions, data: any) {
  return {
    marker: data.marker,
    results: data.lines.map(parseAccountTrustline)
      .filter(_.partial(currencyFilter, options.currency || null)),
  };
}

function getAccountLines(
  connection: Connection,
  address: string,
  ledgerVersion: number,
  options: TrustlinesOptions,
  marker: string,
  limit: number,
): Promise<GetTrustlinesResponse> {
  const request = {
    account: address,
    command: "account_lines",
    ledger_index: ledgerVersion,
    limit: utils.clamp(limit, 10, 400),
    marker,
    peer: options.counterparty,
  };

  return connection.request(request).then(_.partial(formatResponse, options));
}

function getTrustlines(
  address: string,
  options: TrustlinesOptions = {},
): Promise<GetTrustlinesResponse> {
  validate.getTrustlines({address, options});

  return this.getLedgerVersion().then((ledgerVersion: any) => {
    const getter = _.partial(getAccountLines, this.connection, address,
      options.ledgerVersion || ledgerVersion, options);
    return utils.getRecursive(getter, options.limit);
  });
}

export default getTrustlines;
