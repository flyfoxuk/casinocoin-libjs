import * as _ from "lodash";
import * as utils from "./utils";
import parseAccountOrder from "./parse/account-order";
import { Connection } from "../common/connection";
import { OrdersOptions, Order } from "./types";

const { validate } = utils.common;

type GetOrders = Order[];

function requestAccountOffers(
  connection: Connection,
  address: string,
  ledgerVersion: number,
  marker: string,
  limit: number,
): Promise<Object> {
  return connection.request({
    account: address,
    command: "account_offers",
    ledger_index: ledgerVersion,
    limit: utils.clamp(limit, 10, 400),
    marker,
  }).then((data: any) => {
    return {
      marker: data.marker,
      results: data.offers.map(_.partial(parseAccountOrder, address)),
    };
  });
}

function getOrders(
  address: string,
  options: OrdersOptions = {},
): Promise<GetOrders> {
  validate.getOrders({ address, options });

  return utils.ensureLedgerVersion.call(this, options).then((ledgerOptions: any) => {
    const getter = _.partial(requestAccountOffers, this.connection, address,
      ledgerOptions.ledgerVersion);
    return utils.getRecursive(getter, ledgerOptions.limit).then((orders) =>
      _.sortBy(orders, (order) => order.properties.sequence));
  });
}

export default getOrders;
