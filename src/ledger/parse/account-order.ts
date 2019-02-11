import BigNumber from "bignumber.js";
import parseAmount from "./amount";
import { parseTimestamp, adjustQualityForXRP, utils } from "./utils";
import { orderFlags } from "./flags";

// TODO: remove this function once casinocoind provides quality directly
function computeQuality(takerGets: any, takerPays: any) {
    const quotient = new BigNumber(takerPays.value).dividedBy(takerGets.value);
    return quotient.toDigits(16, BigNumber.ROUND_HALF_UP).toString();
}

// casinocoind "account_offers" returns a different format for orders than "tx"
// the flags are also different
function parseAccountOrder(address: string, order: any): Object {
    const direction = (order.flags & orderFlags.Sell) === 0 ? "buy" : "sell";
    const takerGetsAmount = parseAmount(order.taker_gets);
    const takerPaysAmount = parseAmount(order.taker_pays);
    const quantity = (direction === "buy") ? takerPaysAmount : takerGetsAmount;
    const totalPrice = (direction === "buy") ? takerGetsAmount : takerPaysAmount;

    // note: immediateOrCancel and fillOrKill orders cannot enter the order book
    // so we can omit those flags here
    const specification = utils.removeUndefined({
        direction,
        // casinocoind currently does not provide "expiration" in account_offers
        expirationTime: utils.parseTimestamp(order.expiration),
        passive: ((order.flags & orderFlags.Passive) !== 0) || undefined,
        quantity,
        totalPrice,
    });

    const makerExchangeRate = order.quality ?
        utils.adjustQualityForCSC(order.quality.toString(),
            takerGetsAmount.currency, takerPaysAmount.currency) :
        computeQuality(takerGetsAmount, takerPaysAmount);
    const properties = {
        maker: address,
        makerExchangeRate,
        sequence: order.seq,
    };

    return { specification, properties };
}

export default parseAccountOrder;
