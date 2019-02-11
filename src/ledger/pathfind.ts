import * as _ from "lodash";
import { BigNumber } from "bignumber.js";
import * as utils from "./utils";
import parsePathfind from "./parse/pathfind";
import { Connection } from "../common/connection";
import { CasinocoindAmount, Amount } from "../common/types";
import {
  GetPaths,
  PathFind,
  CasinocoindPathsResponse,
  PathFindRequest,
} from "./pathfind-types";

const { validate, toCasinocoindAmount } = utils.common;
const NotFoundError = utils.common.errors.NotFoundError;
const ValidationError = utils.common.errors.ValidationError;

function addParams(request: PathFindRequest, result: CasinocoindPathsResponse) {
  return _.defaults(_.assign({}, result, {
    source_account: request.source_account,
    source_currencies: request.source_currencies,
  }), { destination_amount: request.destination_amount });
}

function requestPathFind(connection: Connection, pathfind: PathFind): Promise<any> {
  const destinationAmount: Amount = _.assign(
    { value: -1 },
    pathfind.destination.amount,
    );
  const request: PathFindRequest = {
    command: "casinocoin_path_find",
    destination_account: pathfind.destination.address,
    destination_amount: toCasinocoindAmount(destinationAmount),
    source_account: pathfind.source.address,
  };
  if (typeof request.destination_amount === "object" &&
    !request.destination_amount.issuer) {
    // Convert blank issuer to sender"s address
    // (Casinocoin convention for "any issuer")
    // https://casinocoin.com/build/transactions/
    //     #special-issuer-values-for-sendmax-and-amount
    // https://casinocoin.com/build/casinocoin-rest/#counterparties-in-payments
    request.destination_amount.issuer = request.destination_account;
  }
  if (pathfind.source.currencies && pathfind.source.currencies.length > 0) {
    request.source_currencies = pathfind.source.currencies.map(
      (amount) => utils.renameCounterpartyToIssuer(amount));
  }
  if (pathfind.source.amount) {
    if (pathfind.destination.amount.value !== undefined) {
      throw new ValidationError("Cannot specify both source.amount" +
        " and destination.amount.value in getPaths");
    }
    request.send_max = toCasinocoindAmount(pathfind.source.amount);
    if (typeof request.send_max !== "string" && !request.send_max.issuer) {
      request.send_max.issuer = pathfind.source.address;
    }
  }

  return connection.request(request).then((paths: any) => addParams(request, paths));
}

function addDirectCscPath(paths: CasinocoindPathsResponse, cscBalance: string): CasinocoindPathsResponse {
  // Add CSC "path" only if the source acct has enough CSC to make the payment
  const destinationAmount = paths.destination_amount;
  // @ts-ignore: destinationAmount can be a currency amount object! Fix!
  if ((new BigNumber(cscBalance)).greaterThanOrEqualTo(destinationAmount)) {
    paths.alternatives.unshift({
      paths_computed: [],
      source_amount: paths.destination_amount,
    });
  }
  return paths;
}

function isCasinocoindIOUAmount(amount: CasinocoindAmount) {
  // casinocoind CSC amounts are specified as decimal strings
  return (typeof amount === "object") &&
    amount.currency && (amount.currency !== "CSC");
}

function conditionallyAddDirectCSCPath(
  connection: Connection,
  address: string,
  paths: CasinocoindPathsResponse,
): Promise<any> {
  if (isCasinocoindIOUAmount(paths.destination_amount) ||
    !_.includes(paths.destination_currencies, "CSC")) {
    return Promise.resolve(paths);
  }
  return utils.getCSCBalance(connection, address, undefined).then(
    (cscBalance: any) => addDirectCscPath(paths, cscBalance),
  );
}

function filterSourceFundsLowPaths(
  pathfind: PathFind,
  paths: CasinocoindPathsResponse,
): CasinocoindPathsResponse {
  if (pathfind.source.amount &&
    pathfind.destination.amount.value === undefined && paths.alternatives) {
    paths.alternatives = _.filter(paths.alternatives, (alt: any) => {
      return !!alt.source_amount &&
        !!pathfind.source.amount &&
        // TODO: Returns false when alt.source_amount is a string. Fix?
        typeof alt.source_amount !== "string" &&
        new BigNumber(alt.source_amount.value).eq(pathfind.source.amount.value);
    });
  }
  return paths;
}

function formatResponse(pathfind: PathFind, paths: CasinocoindPathsResponse) {
  if (paths.alternatives && paths.alternatives.length > 0) {
    return parsePathfind(paths);
  }
  if (paths.destination_currencies !== undefined &&
    !_.includes(paths.destination_currencies,
      pathfind.destination.amount.currency)) {
    throw new NotFoundError("No paths found. " +
      "The destination_account does not accept " +
      pathfind.destination.amount.currency + ", they only accept: " +
      paths.destination_currencies.join(", "));
  } else if (paths.source_currencies && paths.source_currencies.length > 0) {
    throw new NotFoundError("No paths found. Please ensure" +
      " that the source_account has sufficient funds to execute" +
      " the payment in one of the specified source_currencies. If it does" +
      " there may be insufficient liquidity in the network to execute" +
      " this payment right now");
  } else {
    throw new NotFoundError("No paths found." +
      " Please ensure that the source_account has sufficient funds to" +
      " execute the payment. If it does there may be insufficient liquidity" +
      " in the network to execute this payment right now");
  }
}

function getPaths(pathfind: PathFind): Promise<GetPaths> {
  validate.getPaths({ pathfind });

  const address = pathfind.source.address;
  return requestPathFind(this.connection, pathfind)
    .then((paths) =>
      conditionallyAddDirectCSCPath(this.connection, address, paths),
    )
    .then((paths) => filterSourceFundsLowPaths(pathfind, paths))
    .then((paths) => formatResponse(pathfind, paths));
}

export default getPaths;
