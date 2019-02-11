import * as _ from "lodash";
import * as utils from "./utils";
import { orderFlags as flags } from "./flags";
import parseAmount from "./amount";

function parseOrderbookOrder(order: any): Object {
  const direction = (order.Flags & flags.Sell) === 0 ? "buy" : "sell";
  const takerGetsAmount = parseAmount(order.TakerGets);
  const takerPaysAmount = parseAmount(order.TakerPays);
  const quantity = (direction === "buy") ? takerPaysAmount : takerGetsAmount;
  const totalPrice = (direction === "buy") ? takerGetsAmount : takerPaysAmount;

  // note: immediateOrCancel and fillOrKill orders cannot enter the order book
  // so we can omit those flags here
  const specification = utils.removeUndefined({
    direction,
    expirationTime: utils.parseTimestamp(order.Expiration),
    passive: ((order.Flags & flags.Passive) !== 0) || undefined,
    quantity,
    totalPrice,
  });

  const properties = {
    maker: order.Account,
    makerExchangeRate: utils.adjustQualityForCSC(order.quality,
      takerGetsAmount.currency, takerPaysAmount.currency),
    sequence: order.Sequence,
  };

  const takerGetsFunded = order.taker_gets_funded ?
    parseAmount(order.taker_gets_funded) : undefined;
  const takerPaysFunded = order.taker_pays_funded ?
    parseAmount(order.taker_pays_funded) : undefined;
  const available = utils.removeUndefined({
    fundedAmount: takerGetsFunded,
    priceOfFundedAmount: takerPaysFunded,
  });
  const state = _.isEmpty(available) ? undefined : available;
  return utils.removeUndefined({ specification, properties, state });
}

export default parseOrderbookOrder;
