import * as _ from "lodash";
import parseAmount from "./amount";
import { Amount, CasinocoindAmount } from "../../common/types.js";
import { Path, GetPaths, CasinocoindPathsResponse } from "../pathfind-types.js";

function parsePaths(paths: any[]) {
  return paths.map((steps: any[]) => steps.map((step) =>
    _.omit(step, ["type", "type_hex"])));
}

function removeAnyCounterpartyEncoding(address: string, amount: Amount) {
  return amount.counterparty === address ?
    _.omit(amount, "counterparty") : amount;
}

function createAdjustment(address: string, adjustmentWithoutAddress: Object): any {
  const amountKey = _.keys(adjustmentWithoutAddress)[0];
  const amount = adjustmentWithoutAddress[amountKey];
  return _.set({ address }, amountKey,
    removeAnyCounterpartyEncoding(address, amount));
}

function parseAlternative(
  sourceAddress: string,
  destinationAddress: string,
  destinationAmount: CasinocoindAmount,
  alternative: any,
): Path {
  // we use "maxAmount"/"minAmount" here so that the result can be passed
  // directly to preparePayment
  const amounts = (alternative.destination_amount !== undefined) ? {
    destination: { minAmount: parseAmount(alternative.destination_amount) },
    source: { amount: parseAmount(alternative.source_amount) },
  } : {
    destination: { amount: parseAmount(destinationAmount) },
    source: { maxAmount: parseAmount(alternative.source_amount) },
    };

  return {
    destination: createAdjustment(destinationAddress, amounts.destination),
    paths: JSON.stringify(parsePaths(alternative.paths_computed)),
    source: createAdjustment(sourceAddress, amounts.source),
  };
}

function parsePathfind(pathfindResult: CasinocoindPathsResponse): GetPaths {
  const sourceAddress = pathfindResult.source_account;
  const destinationAddress = pathfindResult.destination_account;
  const destinationAmount = pathfindResult.destination_amount;
  return pathfindResult.alternatives.map((alt: any) => {
    parseAlternative(sourceAddress, destinationAddress, destinationAmount, alt);
  });
}

export default parsePathfind;
