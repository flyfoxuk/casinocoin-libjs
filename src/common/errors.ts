
import {inspect} from 'util'
import * as browserHacks from './browser-hacks'

class CasinocoinError extends Error {

  name: string
  message: string
  data?: any

  constructor(message = '', data?: any) {
    super(message)

    this.name = browserHacks.getConstructorName(this)
    this.message = message
    this.data = data
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toString() {
    let result = '[' + this.name + '(' + this.message
    if (this.data) {
      result += ', ' + inspect(this.data)
    }
    result += ')]'
    return result
  }

  /* console.log in node uses util.inspect on object, and util.inspect allows
  us to cutomize its output:
  https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects */
  inspect() {
    return this.toString()
  }
}

class CasinocoindError extends CasinocoinError {}

class UnexpectedError extends CasinocoinError {}

class LedgerVersionError extends CasinocoinError {}

class ConnectionError extends CasinocoinError {}

class NotConnectedError extends ConnectionError {}

class DisconnectedError extends ConnectionError {}

class CasinocoindNotInitializedError extends ConnectionError {}

class TimeoutError extends ConnectionError {}

class ResponseFormatError extends ConnectionError {}

class ValidationError extends CasinocoinError {}

class NotFoundError extends CasinocoinError {
  constructor(message = 'Not found') {
    super(message)
  }
}

class MissingLedgerHistoryError extends CasinocoinError {
  constructor(message?: string) {
    super(message || 'Server is missing ledger history in the specified range')
  }
}

class PendingLedgerVersionError extends CasinocoinError {
  constructor(message?: string) {
    super(message || 'maxLedgerVersion is greater than server\'s most recent ' +
      ' validated ledger')
  }
}

export {
  CasinocoinError,
  UnexpectedError,
  ConnectionError,
  CasinocoindError,
  NotConnectedError,
  DisconnectedError,
  CasinocoindNotInitializedError,
  TimeoutError,
  ResponseFormatError,
  ValidationError,
  NotFoundError,
  PendingLedgerVersionError,
  MissingLedgerHistoryError,
  LedgerVersionError
}
