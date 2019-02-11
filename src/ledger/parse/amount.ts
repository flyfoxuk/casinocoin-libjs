import * as utils from "./utils";
import { Amount, CasinocoindAmount } from "../../common/types";

function parseAmount(amount: CasinocoindAmount): Amount {
  if (typeof amount === "string") {
    return {
      currency: "CSC",
      value: utils.common.dropsToCsc(amount),
    };
  }
  return {
    counterparty: amount.issuer,
    currency: amount.currency,
    value: amount.value,
  };
}

export default parseAmount;
