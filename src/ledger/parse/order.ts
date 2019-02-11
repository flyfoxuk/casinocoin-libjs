import * as assert from "assert";
import * as utils from "./utils";
import parseAmount from "./amount";

const flags = utils.txFlags.OfferCreate;

function parseOrder(tx: any): Object {
  assert(tx.TransactionType === "OfferCreate");

  const direction = (tx.Flags & flags.Sell) === 0 ? "buy" : "sell";
  const takerGetsAmount = parseAmount(tx.TakerGets);
  const takerPaysAmount = parseAmount(tx.TakerPays);
  const quantity = (direction === "buy") ? takerPaysAmount : takerGetsAmount;
  const totalPrice = (direction === "buy") ? takerGetsAmount : takerPaysAmount;

  return utils.removeUndefined({
    direction,
    expirationTime: utils.parseTimestamp(tx.Expiration),
    fillOrKill: ((tx.Flags & flags.FillOrKill) !== 0) || undefined,
    immediateOrCancel: ((tx.Flags & flags.ImmediateOrCancel) !== 0)
      || undefined,
    passive: ((tx.Flags & flags.Passive) !== 0) || undefined,
    quantity,
    totalPrice,
  });
}

export default parseOrder;
