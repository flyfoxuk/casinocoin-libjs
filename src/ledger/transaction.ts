import * as _ from "lodash";
import * as utils from "./utils";
import parseTransaction from "./parse/transaction";
import { Connection } from "../common/connection";
import {
  TransactionType,
  TransactionOptions,
  TransactionResponse,
} from "./transaction-types";

const { validate, errors } = utils.common;

function attachTransactionDate(connection: Connection, tx: any,
): Promise<TransactionType> {
  if (tx.date) {
    return Promise.resolve(tx);
  }

  const ledgerVersion = tx.ledger_index || tx.LedgerSequence;

  if (!ledgerVersion) {
    return new Promise(() => {
      throw new errors.NotFoundError(
        "ledger_index and LedgerSequence not found in tx");
    });
  }

  const request = {
    command: "ledger",
    ledger_index: ledgerVersion,
  };

  return connection.request(request).then((data: any) => {
    if (typeof data.ledger.close_time === "number") {
      return _.assign({ date: data.ledger.close_time }, tx);
    }
    throw new errors.UnexpectedError("Ledger missing close_time");
  }).catch((error: any) => {
    if (error instanceof errors.UnexpectedError) {
      throw error;
    }
    throw new errors.NotFoundError("Transaction ledger not found");
  });
}

function isTransactionInRange(tx: any, options: TransactionOptions) {
  return (!options.minLedgerVersion
    || tx.ledger_index >= options.minLedgerVersion)
    && (!options.maxLedgerVersion
      || tx.ledger_index <= options.maxLedgerVersion);
}

function convertError(
  connection: Connection,
  options: TransactionOptions,
  error: Error,
): Promise<Error|PendingLedgerVersionError|MissingLedgerHistoryError> {
  const errState = (error.message === "txnNotFound") ?
    new errors.NotFoundError("Transaction not found") : error;
  if (errState instanceof errors.NotFoundError) {
    return utils.hasCompleteLedgerRange(connection, options.minLedgerVersion,
      options.maxLedgerVersion).then((hasCompleteLedgerRange) => {
        if (!hasCompleteLedgerRange) {
          return utils.isPendingLedgerVersion(
            connection, options.maxLedgerVersion)
            .then((isPendingLedgerVersion) => {
              return isPendingLedgerVersion ?
                new errors.PendingLedgerVersionError() :
                new errors.MissingLedgerHistoryError();
            });
        }
        return errState;
      });
  }
  return Promise.resolve(errState);
}

function formatResponse(options: TransactionOptions, tx: TransactionResponse,
): TransactionType {
  if (tx.validated !== true || !isTransactionInRange(tx, options)) {
    throw new errors.NotFoundError("Transaction not found");
  }
  return parseTransaction(tx);
}

function getTransaction(id: string, options: TransactionOptions = {},
): Promise<TransactionType> {
  validate.getTransaction({ id, options });

  const request = {
    binary: false,
    command: "tx",
    transaction: id,
  };

  return utils.ensureLedgerVersion.call(this, options).then((ledgerOptions: any) => {
    return this.connection.request(request).then((tx: TransactionResponse) =>
      attachTransactionDate(this.connection, tx),
    ).then(_.partial(formatResponse, ledgerOptions))
      .catch((error: any) => {
        return convertError(this.connection, ledgerOptions, error).then((errState) => {
          throw errState;
        });
      });
  });
}

export default getTransaction;
