import * as _ from 'lodash'
import {assert} from 'assert-diff'

import {CasinocoinAPI} from '../src/api'
import * as setupApi from './setup-api'
import * as binary from 'casinocoin-libjs-binary-codec'

const fixtures = require('./fixtures')
const addresses = require('./fixtures/addresses')
const hashes = require('../fixtures/hashes')
const ledgerClosed = require('./fixtures/casinocoind/ledger-close-newer')

const validate = CasinocoinAPI._PRIVATE.validate
const requests = fixtures.requests
const responses = fixtures.responses
const address = addresses.ACCOUNT
const testAccount = addresses.TEST_ACCOUNT
const utils = CasinocoinAPI._PRIVATE.ledgerUtils
const schemaValidator = CasinocoinAPI._PRIVATE.schemaValidator

assert.options.strict = true

// how long before each test case times out
const TIMEOUT = window ? 25000 : 10000

function unused(hash) {
  hash.toString()
}

function closeLedger(connection) {
  connection._ws.emit('message', JSON.stringify(ledgerClosed))
}

function checkResult(expected, schemaName, response) {
  if (expected.txJSON) {
    assert(response.txJSON)
    assert.deepStrictEqual(
      JSON.parse(response.txJSON),
      JSON.parse(expected.txJSON)
    )
  }
  assert.deepStrictEqual(_.omit(response, 'txJSON'), _.omit(expected, 'txJSON'))
  if (schemaName) {
    schemaValidator.schemaValidate(schemaName, response)
  }
  return response
}


function checkTestResult(expected, schemaName, response) {
  if (expected.txJSON) {
    assert(response.txJSON)
    assert.deepStrictEqual(
      JSON.parse(response.txJSON),
      JSON.parse(expected.txJSON)
    )
  }
  assert.deepStrictEqual(_.omit(response, 'txJSON'), _.omit(expected, 'txJSON'))
  if (schemaName) {
    schemaValidator.schemaValidate(schemaName, response)
  }
  return response
}


describe('CasinocoinAPI', () => {
  this.timeout(TIMEOUT)
  const instructions = {maxLedgerVersionOffset: 100}

  beforeEach(setupApi.setup)
  afterEach(setupApi.teardown)

  it('error inspect', () => {
    const error = new this.api.errors.CasinocoinError('mess', {data: 1})
    assert.strictEqual(error.inspect(), '[CasinocoinError(mess, { data: 1 })]')
  })

  describe('preparePayment', () => {

    it('normal', () => {
      const localInstructions = _.defaults({
        maxFee: '0.000012'
      }, instructions)
      return this.api.preparePayment(
        address, requests.preparePayment.normal, localInstructions).then(
        _.partial(checkResult, responses.preparePayment.normal, 'prepare'))
    })

    it('preparePayment - min amount csc', () => {
      const localInstructions = _.defaults({
        maxFee: '0.000012'
      }, instructions)
      return this.api.preparePayment(
        address, requests.preparePayment.minAmountCSC, localInstructions).then(
        _.partial(checkResult,
          responses.preparePayment.minAmountCSC, 'prepare'))
    })

    it('preparePayment - min amount csc2csc', () => {
      return this.api.preparePayment(
        address, requests.preparePayment.minAmount, instructions).then(
        _.partial(checkResult,
          responses.preparePayment.minAmountCSCCSC, 'prepare'))
    })

    it('preparePayment - CSC to CSC no partial', () => {
      assert.throws(() => {
        this.api.preparePayment(address, requests.preparePayment.wrongPartial)
      }, /CSC to CSC payments cannot be partial payments/)
    })

    it(
      'preparePayment - address must match payment.source.address',
      () => {
        assert.throws(() => {
          this.api.preparePayment(address, requests.preparePayment.wrongAddress)
        }, /address must match payment.source.address/)
      })

    it('preparePayment - wrong amount', () => {
      assert.throws(() => {
        this.api.preparePayment(address, requests.preparePayment.wrongAmount)
      }, this.api.errors.ValidationError)
    })

    it('preparePayment with all options specified', () => {
      return this.api.getLedgerVersion().then(ver => {
        const localInstructions = {
          maxLedgerVersion: ver + 100,
          fee: '0.000012'
        }
        return this.api.preparePayment(
          address, requests.preparePayment.allOptions, localInstructions).then(
          _.partial(checkResult,
            responses.preparePayment.allOptions, 'prepare'))
      })
    })

    it('preparePayment without counterparty set', () => {
      const localInstructions = _.defaults({sequence: 23}, instructions)
      return this.api.preparePayment(
        address, requests.preparePayment.noCounterparty, localInstructions)
        .then(_.partial(checkResult, responses.preparePayment.noCounterparty,
          'prepare'))
    })

    it('preparePayment - destination.minAmount', () => {
      return this.api.preparePayment(address, responses.getPaths.sendAll[0],
        instructions).then(_.partial(checkResult,
        responses.preparePayment.minAmount, 'prepare'))
    })
  })

  it('prepareTrustline - simple', () => {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.simple, instructions).then(
      _.partial(checkResult, responses.prepareTrustline.simple, 'prepare'))
  })

  it('prepareTrustline - frozen', () => {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.frozen).then(
      _.partial(checkResult, responses.prepareTrustline.frozen, 'prepare'))
  })

  it('prepareTrustline - complex', () => {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.complex, instructions).then(
      _.partial(checkResult, responses.prepareTrustline.complex, 'prepare'))
  })

  it('prepareSettings', () => {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, instructions).then(
      _.partial(checkResult, responses.prepareSettings.flags, 'prepare'))
  })

  it('prepareSettings - no maxLedgerVersion', () => {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, {maxLedgerVersion: null}).then(
      _.partial(checkResult, responses.prepareSettings.noMaxLedgerVersion,
        'prepare'))
  })

  it('prepareSettings - no instructions', () => {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain).then(
      _.partial(
        checkResult,
        responses.prepareSettings.noInstructions,
        'prepare'))
  })

  it('prepareSettings - regularKey', () => {
    const regularKey = {regularKey: 'cQw6KZ7CyvNmdBtjfdj15puULG3rCBXXvV'}
    return this.api.prepareSettings(address, regularKey, instructions).then(
      _.partial(checkResult, responses.prepareSettings.regularKey, 'prepare'))
  })

  it('prepareSettings - remove regularKey', () => {
    const regularKey = {regularKey: null}
    return this.api.prepareSettings(address, regularKey, instructions).then(
      _.partial(checkResult, responses.prepareSettings.removeRegularKey,
        'prepare'))
  })

  it('prepareSettings - flag set', () => {
    const settings = {requireDestinationTag: true}
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.flagSet, 'prepare'))
  })

  it('prepareSettings - flag clear', () => {
    const settings = {requireDestinationTag: false}
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.flagClear, 'prepare'))
  })

  it('prepareSettings - integer field clear', () => {
    const settings = {transferRate: null}
    return this.api.prepareSettings(address, settings, instructions)
      .then(data => {
        assert(data)
        assert.strictEqual(JSON.parse(data.txJSON).TransferRate, 0)
      })
  })

  it('prepareSettings - set transferRate', () => {
    const settings = {transferRate: 1}
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.setTransferRate,
        'prepare'))
  })

  it('prepareSettings - set signers', () => {
    const settings = requests.prepareSettings.signers
    return this.api.prepareSettings(address, settings, instructions).then(
      _.partial(checkResult, responses.prepareSettings.signers,
        'prepare'))
  })

  it('prepareSettings - fee for multisign', () => {
    this.api._feeCushion = 1
    const localInstructions = _.defaults({
      signersCount: 4
    }, instructions)
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, localInstructions).then(
      _.partial(checkResult, responses.prepareSettings.flagsMultisign,
        'prepare'))
  })

  it('sign', () => {
    const secret = 'ssfk8HUiBSCJ17R99GbYcTZS6ASpY'
    const result = this.api.sign(requests.sign.normal.txJSON, secret)
    assert.deepStrictEqual(result, responses.sign.normal)
    schemaValidator.schemaValidate('sign', result)
  })

  it('sign - already signed', () => {
    const secret = 'ssfk8HUiBSCJ17R99GbYcTZS6ASpY'
    const result = this.api.sign(requests.sign.normal.txJSON, secret)
    assert.throws(() => {
      const tx = JSON.stringify(binary.decode(result.signedTransaction))
      this.api.sign(tx, secret)
    }, /txJSON must not contain "TxnSignature" or "Signers" properties/)
  })

  it('sign - signAs', () => {
    const txJSON = requests.sign.signAs
    const secret = 'shPfF1bJQwMZngxuBPkQAjPNeAwCV'
    const signature = this.api.sign(JSON.stringify(txJSON), secret,
      {signAs: 'ch6BULZAU4qrQaWQccJSwcFgEYhz2Ysz4a'})
    assert.deepStrictEqual(signature, responses.sign.signAs)
  })

  it('submit', () => {
    return this.api.submit(responses.sign.normal.signedTransaction).then(
      _.partial(checkResult, responses.submit, 'submit'))
  })

  it('submit - failure', () => {
    return this.api.submit('BAD').then(() => {
      assert(false, 'Should throw CasinocoindError')
    }).catch(error => {
      assert(error instanceof this.api.errors.CasinocoindError)
      assert.strictEqual(error.data.resultCode, 'temBAD_FEE')
    })
  })

  it('combine', () => {
    const combined = this.api.combine(requests.combine.setDomain)
    checkResult(responses.combine.single, 'sign', combined)
  })

  it('combine - different transactions', () => {
    const request = [requests.combine.setDomain[0]]
    const tx = binary.decode(requests.combine.setDomain[0])
    tx.Flags = 0
    request.push(binary.encode(tx))
    assert.throws(() => {
      this.api.combine(request)
    }, /txJSON is not the same for all signedTransactions/)
  })

  describe('CasinocoinAPI', () => {

    it('getBalances', () => {
      return this.api.getBalances(address).then(
        _.partial(checkResult, responses.getBalances, 'getBalances'))
    })

    it('getBalances - limit', () => {
      const expectedResponse = responses.getBalances.slice(0, 3)
      return this.api.getBalances(address, {
        limit: 3,
        ledgerVersion: 123456
      }).then(
        _.partial(checkResult, expectedResponse, 'getBalances'))
    })

    it('getBalances - limit & currency', () => {
      const expectedResponse = _.filter(responses.getBalances,
        item => item.currency === 'USD').slice(0, 3)
      return this.api.getBalances(address, {
        currency: 'USD',
        limit: 3
      }).then(
        _.partial(checkResult, expectedResponse, 'getBalances'))
    })

    it('getBalances - limit & currency & issuer', () => {
      const counterparty = 'cHgi1NnXELNYchbFpAVXdoX22iWJti2Kgs'
      const expectedResponse = _.filter(responses.getBalances,
        item => item.currency === 'USD' &&
          item.counterparty === counterparty).slice(0, 3)
      return this.api.getBalances(address, {
        currency: 'USD',
        counterparty: counterparty,
        limit: 3
      }).then(
        _.partial(checkResult, expectedResponse, 'getBalances'))
    })
  })

  it('getBalanceSheet', () => {
    return this.api.getBalanceSheet(address).then(
      _.partial(checkResult, responses.getBalanceSheet, 'getBalanceSheet'))
  })

  it('getBalanceSheet - invalid options', () => {
    assert.throws(() => {
      this.api.getBalanceSheet(address, {invalid: 'options'})
    }, this.api.errors.ValidationError)
  })

  it('getBalanceSheet - empty', () => {
    return this.api.getBalanceSheet(address, {
      ledgerVersion: 123456
    }).then(
      _.partial(checkResult, {}, 'getBalanceSheet'))
  })

  describe('getTransaction', () => {
    it('getTransaction - payment', () => {
      return this.api.getTransaction(hashes.SECOND_VALID_TRANSACTION_HASH).then(
        _.partial(checkResult, responses.getTransaction.paymentSecond,
          'getTransaction'))
    })

    it('getTransaction - settings', () => {
      return this.api.getTransaction(
        '4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA1B'
      ).then(
        _.partial(checkResult, responses.getTransaction.settings,
          'getTransaction'))
    })
    it('getTransaction - trustline set', () => {
      return this.api.getTransaction(
        '635A0769BD94710A1F6A76CDE65A3BC661B20B798807D1BBBDADCEA26420538D'
      ).then(
        _.partial(checkResult, responses.getTransaction.trustline,
          'getTransaction'))
    })

    it('getTransaction - trustline frozen off', () => {
      return this.api.getTransaction(
        'FE72FAD0FA7CA904FB6C633A1666EDF0B9C73B2F5A4555D37EEF2739A78A531B'
      ).then(
        _.partial(checkResult, responses.getTransaction.trustlineFrozenOff,
          'getTransaction'))
    })

    it('getTransaction - trustline no quality', () => {
      return this.api.getTransaction(
        'BAF1C678323C37CCB7735550C379287667D8288C30F83148AD3C1CB019FC9002'
      ).then(
        _.partial(checkResult, responses.getTransaction.trustlineNoQuality,
          'getTransaction'))
    })

    it('getTransaction - not validated', () => {
      return this.api.getTransaction(
        '4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA10'
      ).then(() => {
        assert(false, 'Should throw NotFoundError')
      }).catch(error => {
        assert(error instanceof this.api.errors.NotFoundError)
      })
    })

    it('getTransaction - tracking on', () => {
      return this.api.getTransaction(
        '8925FC8844A1E930E2CC76AD0A15E7665AFCC5425376D548BB1413F484C31B8C'
      ).then(
        _.partial(checkResult, responses.getTransaction.trackingOn,
          'getTransaction'))
    })

    it('getTransaction - tracking off', () => {
      return this.api.getTransaction(
        'C8C5E20DFB1BF533D0D81A2ED23F0A3CBD1EF2EE8A902A1D760500473CC9C582'
      ).then(
        _.partial(checkResult, responses.getTransaction.trackingOff,
          'getTransaction'))
    })

    it('getTransaction - set regular key', () => {
      return this.api.getTransaction(
        '278E6687C1C60C6873996210A6523564B63F2844FB1019576C157353B1813E60'
      ).then(
        _.partial(checkResult, responses.getTransaction.setRegularKey,
          'getTransaction'))
    })

    it('getTransaction - not found in range', () => {
      return this.api.getTransaction(
        '809335DD3B0B333865096217AA2F55A4DF168E0198080B3A090D12D88880FF0E',
        {
          minLedgerVersion: 32570,
          maxLedgerVersion: 32571
        }).then(() => {
        assert(false, 'Should throw NotFoundError')
      }).catch(error => {
        assert(error instanceof this.api.errors.NotFoundError)
      })
    })

    it('getTransaction - not found by hash', () => {
      return this.api.getTransaction(hashes.NOTFOUND_TRANSACTION_HASH)
        .then(() => {
          assert(false, 'Should throw NotFoundError')
        }).catch(error => {
          assert(error instanceof this.api.errors.NotFoundError)
        })
    })

    it('getTransaction - missing ledger history', () => {
      closeLedger(this.api.connection)
      return this.api.getTransaction(hashes.NOTFOUND_TRANSACTION_HASH)
        .then(() => {
          assert(false, 'Should throw MissingLedgerHistoryError')
        }).catch(error => {
          assert(error instanceof this.api.errors.MissingLedgerHistoryError)
        })
    })

    it('getTransaction - missing ledger history with ledger range', () => {
      return this.api.getTransaction(hashes.NOTFOUND_TRANSACTION_HASH, {
        minLedgerVersion: 1,
        maxLedgerVersion: 32571
      }).then(() => {
        assert(false, 'Should throw MissingLedgerHistoryError')
      }).catch(error => {
        assert(error instanceof this.api.errors.MissingLedgerHistoryError)
      })
    })

    it('getTransaction - not found - future maxLedgerVersion', () => {
      return this.api.getTransaction(hashes.NOTFOUND_TRANSACTION_HASH, {
        maxLedgerVersion: 99999999999
      }).then(() => {
        assert(false, 'Should throw PendingLedgerVersionError')
      }).catch(error => {
        assert(error instanceof this.api.errors.PendingLedgerVersionError)
      })
    })

    it('getTransaction - ledger_index not found', () => {
      return this.api.getTransaction(
        '4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA11')
        .then(() => {
          assert(false, 'Should throw NotFoundError')
        }).catch(error => {
          assert(error instanceof this.api.errors.NotFoundError)
          assert(error.message.indexOf('ledger_index') !== -1)
        })
    })

    it('getTransaction - transaction ledger not found', () => {
      return this.api.getTransaction(
        '4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA12')
        .then(() => {
          assert(false, 'Should throw NotFoundError')
        }).catch(error => {
          assert(error instanceof this.api.errors.NotFoundError)
          assert(error.message.indexOf('ledger not found') !== -1)
        })
    })

    it('getTransaction - ledger missing close time', () => {
      closeLedger(this.api.connection)
      return this.api.getTransaction(
        '0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A04')
        .then(() => {
          assert(false, 'Should throw UnexpectedError')
        }).catch(error => {
          assert(error instanceof this.api.errors.UnexpectedError)
        })
    })
    it('getTransaction - no Meta', () => {
      return this.api.getTransaction(
        'AFB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA1B')
        .then(result => {
          assert.deepStrictEqual(result, responses.getTransaction.noMeta)
        })
    })

    it('getTransaction - Unrecognized transaction type', () => {
      closeLedger(this.api.connection)
      return this.api.getTransaction(
        'AFB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA11')
        .then(() => {
          assert(false, 'Unrecognized transaction type')
        }).catch(error => {
          assert.strictEqual(error.message, 'Unrecognized transaction type')
        })
    })

    it('getTransaction - amendment', () => {
      return this.api.getTransaction(
        'A971B83ABED51D83749B73F3C1AAA627CD965AFF74BE8CD98299512D6FB0658F')
        .then(result => {
          assert.deepStrictEqual(result, responses.getTransaction.amendment)
        })
    })

    it('getTransaction - feeUpdate', () => {
      return this.api.getTransaction(
        '27145769EB12C7721FDE491E71EFD3CD3B5ECE3E0DBC0CF5D1EEDB0CD93FF8F4')
        .then(result => {
          assert.deepStrictEqual(result, responses.getTransaction.feeUpdate)
        })
    })
  })

  //

  it('getTransactions', () => {
    return this.api.getTransactions(testAccount.ACCOUNT, {
        types: ['payment'],
        initiated: true,
        limit: 2
      }
    ).then(
      _.partial(checkTestResult, responses.getTransactions.normal,
        'getTransactions'))
  })

  it('getTransactions - earliest first', () => {
    const expected = _.cloneDeep(responses.getTransactions.earliest)
      .sort(utils.compareTransactions)
    return this.api.getTransactions(testAccount.ACCOUNT, {
      types: ['payment'],
      initiated: true,
      limit: 2,
      earliestFirst: true
    }).then(
      _.partial(checkResult, expected, 'getTransactions'))
  })

//      @TODO: Fix this test
//     it('getTransactions - earliest first with start option', () => {
//     const expected = _.cloneDeep(responses.getTransactions.earliestWithStart)
//             .sort(utils.compareTransactions)
//
//         return this.api.getTransactions(testAccount.ACCOUNT, {
//             types: ['payment'],
//             initiated: true,
//             limit: 2,
//             start: hashes.VALID_TRANSACTION_HASH,
//             earliestFirst: true
//         }).then(
//             _.partial(checkResult, expected, 'getTransactions'))
//     })

  it('getTransactions - gap', () => {
    return this.api.getTransactions(testAccount.ACCOUNT, {
      types: ['payment'],
      initiated: true,
      limit: 2,
      maxLedgerVersion: 348858000
    }).then(() => {
      assert(false, 'Should throw MissingLedgerHistoryError')
    }).catch(error => {
      assert(error instanceof this.api.errors.MissingLedgerHistoryError)
    })
  })

  it('getTransactions - tx not found', () => {
    return this.api.getTransactions(testAccount.ACCOUNT, {
      types: ['payment'],
      initiated: true,
      limit: 2,
      start: hashes.NOTFOUND_TRANSACTION_HASH,
      counterparty: testAccount.ACCOUNT
    }).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })

  it('getTransactions - filters', () => {
    return this.api.getTransactions(testAccount.ACCOUNT, {
      types: ['payment', 'order'],
      initiated: true,
      limit: 10,
      excludeFailures: true,
      counterparty: testAccount.COUNTERPARTY
    }).then(data => {
      assert.strictEqual(data.length, 10)
      assert(_.every(data, t => t.type === 'payment' || t.type === 'order'))
      assert(_.every(data, t => t.outcome.result === 'tesSUCCESS'))
    })
  })

  // @TODO: Need to add an example to the response
  // it('getTransactions - filters for incoming', function() => {
  //   return this.api.getTransactions( testAccount.ACCOUNT, {
  //       types: ['payment'],
  //       initiated: false,
  //       limit: 10,
  //       excludeFailures: true,
  //       counterparty: testAccount.COUNTERPARTY
  //   }).then(data => {
  //     assert.strictEqual(data.length, 0)
  //     assert(_.every(data, t => t.type === 'payment' || t.type === 'order'))
  //     assert(_.every(data, t => t.outcome.result === 'tesSUCCESS'))
  //   })
  // })
  //
  // this is the case where core.CasinocoinError just falls
  // through the api to the user


  it('getTransactions - error', () => {
    return this.api.getTransactions(address, {
      types: ['payment'],
      initiated: true,
      limit: 13
    }).then(() => {
      assert(false, 'Should throw CasinocoinError')
    }).catch(error => {
      assert(error instanceof this.api.errors.CasinocoinError)
    })
  })
  //
  // // TODO: this doesn't test much, just that it doesn't crash
  // it('getTransactions with start option', function() => {
  //   const options = {
  //     start: hashes.SECOND_VALID_TRANSACTION_HASH,
  //     earliestFirst: false,
  //     limit: 2
  //   }
  //   return this.api.getTransactions(addresses.OTHER_ACCOUNT, options).then(
  //     _.partial(checkResult, responses.getTransactions.one,
  //       'getTransactions'))
  // })
//
//   it('getTransactions - start transaction with zero ledger version',
//   () => {
//     const options = {
//  start: '4FB3ADF22F3C605E23FAEFAA185F3BD763C4692CAC490D9819D117CD33BFAA13',
//  limit: 1
//     }
//     return this.api.getTransactions(address, options).then(
//       _.partial(checkResult, [], 'getTransactions'))
//   })

  it('getTransactions - no options', () => {
    return this.api.getTransactions(addresses.OTHER_ACCOUNT).then(
      _.partial(checkResult, responses.getTransactions.one, 'getTransactions'))
  })

  it('getTrustlines - filtered', () => {
    return this.api.getTrustlines(address, {
      currency: 'USD'
    }).then(
      _.partial(checkResult,
        responses.getTrustlines.filtered, 'getTrustlines'))
  })

  it('getTrustlines - no options', () => {
    return this.api.getTrustlines(address).then(
      _.partial(checkResult, responses.getTrustlines.all, 'getTrustlines'))
  })

  // NO CLUE!!!! ???¿¿¿
  // it('generateAddress', () => {
  //     function random() => {
  //         return _.fill(Array(32), 0)
  //     }
  //
  //     assert.deepStrictEqual(this.api.generateAddress({entropy: random()}),
  //         responses.generateAddress)
  // })

  it('generateAddress invalid', () => {
    assert.throws(() => {
      function random() {
        return _.fill(Array(1), 0)
      }

      this.api.generateAddress({entropy: random()})
    }, this.api.errors.UnexpectedError)
  })

  it('getSettings', () => {
    return this.api.getSettings(address).then(
      _.partial(checkResult, responses.getSettings, 'getSettings'))
  })

  it('getSettings - options undefined', () => {
    return this.api.getSettings(address, undefined).then(
      _.partial(checkResult, responses.getSettings, 'getSettings'))
  })

  it('getSettings - invalid options', () => {
    assert.throws(() => {
      this.api.getSettings(address, {invalid: 'options'})
    }, this.api.errors.ValidationError)
  })

  it('getAccountInfo', () => {
    return this.api.getAccountInfo(address).then(
      _.partial(checkResult, responses.getAccountInfo, 'getAccountInfo'))
  })

  it('getAccountInfo - options undefined', () => {
    return this.api.getAccountInfo(address, undefined).then(
      _.partial(checkResult, responses.getAccountInfo, 'getAccountInfo'))
  })

  it('getAccountInfo - invalid options', () => {
    assert.throws(() => {
      this.api.getAccountInfo(address, {invalid: 'options'})
    }, this.api.errors.ValidationError)
  })

  it('getServerInfo', () => {
    return this.api.getServerInfo().then(
      _.partial(checkResult, responses.getServerInfo, 'getServerInfo'))
  })

  it('getServerInfo - error', () => {
    this.api.connection._send(JSON.stringify({
      command: 'config',
      data: {returnErrorOnServerInfo: true}
    }))

    return this.api.getServerInfo().then(() => {
      assert(false, 'Should throw NetworkError')
    }).catch(error => {
      assert(error instanceof this.api.errors.CasinocoindError)
      assert(_.includes(error.message, 'slowDown'))
    })
  })

  it('getServerInfo - no validated ledger', () => {
    this.api.connection._send(JSON.stringify({
      command: 'config',
      data: {serverInfoWithoutValidated: true}
    }))

    return this.api.getServerInfo().then(info => {
      assert.strictEqual(info.networkLedger, 'waiting')
    }).catch(error => {
      assert(false, 'Should not throw Error, got ' + String(error))
    })
  })

  it('getFee', () => {
    return this.api.getFee().then(fee => {
      assert.strictEqual(fee, '0.000012')
    })
  })

  it('getFee default', () => {
    this.api._feeCushion = undefined
    return this.api.getFee().then(fee => {
      assert.strictEqual(fee, '0.000012')
    })
  })

  it('disconnect & isConnected', () => {
    assert.strictEqual(this.api.isConnected(), true)
    return this.api.disconnect().then(() => {
      assert.strictEqual(this.api.isConnected(), false)
    })
  })

  it('getPaths', () => {
    return this.api.getPaths(requests.getPaths.normal).then(
      _.partial(checkResult, responses.getPaths.CscToUsd, 'getPaths'))
  })

  it('getPaths - queuing', () => {
    return Promise.all([
      this.api.getPaths(requests.getPaths.normal),
      this.api.getPaths(requests.getPaths.UsdToUsd),
      this.api.getPaths(requests.getPaths.CscToCsc)
    ]).then(results => {
      checkResult(responses.getPaths.CscToUsd, 'getPaths', results[0])
    })
  })


  it('getPaths USD 2 USD', () => {
    return this.api.getPaths(requests.getPaths.UsdToUsd).then(
      _.partial(checkResult, responses.getPaths.UsdToUsd, 'getPaths'))
  })

  it('getPaths CSC 2 CSC', () => {
    return this.api.getPaths(requests.getPaths.CscToCsc).then(
      _.partial(checkResult, responses.getPaths.CscToCsc, 'getPaths'))
  })

  it('getPaths - source with issuer', () => {
    return this.api.getPaths(requests.getPaths.issuer).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })

  it('getPaths - CSC 2 CSC - not enough', () => {
    return this.api.getPaths(requests.getPaths.CscToCscNotEnough).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })

  it('getPaths - invalid PathFind', () => {
    assert.throws(() => {
      this.api.getPaths(requests.getPaths.invalid)
    }, /Cannot specify both source.amount/)
  })

  it('getPaths - does not accept currency', () => {
    return this.api.getPaths(requests.getPaths.NotAcceptCurrency).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })

  it('getPaths - no paths', () => {
    return this.api.getPaths(requests.getPaths.NoPaths).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })

  it('getPaths - no paths source amount', () => {
    return this.api.getPaths(requests.getPaths.NoPathsSource).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })


  it('getPaths - no paths with source currencies', () => {
    const pathfind = requests.getPaths.NoPathsWithCurrencies
    return this.api.getPaths(pathfind).then(() => {
      assert(false, 'Should throw NotFoundError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotFoundError)
    })
  })

  it('getPaths - error: srcActNotFound', () => {
    const pathfind = _.assign({}, requests.getPaths.normal,
      {source: {address: addresses.NOTFOUND}})
    return this.api.getPaths(pathfind).catch(error => {
      assert(error instanceof this.api.errors.CasinocoinError)
    })
  })

  it('getPaths - send all', () => {
    return this.api.getPaths(requests.getPaths.sendAll).then(
      _.partial(checkResult, responses.getPaths.sendAll, 'getPaths'))
  })

  it('getLedgerVersion', function (done) {
    this.api.getLedgerVersion().then(ver => {
      assert.strictEqual(ver, 8819951)
      done()
    }, done)
  })

  it('getFeeBase', function (done) {
    this.api.connection.getFeeBase().then(fee => {
      assert.strictEqual(fee, 10)
      done()
    }, done)
  })

  it('getFeeRef', function (done) {
    this.api.connection.getFeeRef().then(fee => {
      assert.strictEqual(fee, 10)
      done()
    }, done)
  })

  it('getLedger', () => {
    return this.api.getLedger().then(
      _.partial(checkResult, responses.getLedger.header, 'getLedger'))
  })

  it('getLedger - future ledger version', () => {
    return this.api.getLedger({ledgerVersion: 14661789}).then(() => {
      assert(false, 'Should throw LedgerVersionError')
    }).catch(error => {
      assert(error instanceof this.api.errors.LedgerVersionError)
    })
  })

  it('getLedger - with state as hashes', () => {
    return this.api.getLedger({
      includeTransactions: true,
      includeAllData: false,
      includeState: true,
      ledgerVersion: 6
    }).then(
      _.partial(checkResult, responses.getLedger.withStateAsHashes,
        'getLedger'))
  })

  it('getLedger - with settings transaction', () => {
    return this.api.getLedger({
      includeTransactions: true,
      includeAllData: true,
      ledgerVersion: 4181996
    }).then(
      _.partial(checkResult, responses.getLedger.withSettingsTx, 'getLedger'))
  })

  it('getLedger - with partial payment', () => {
    return this.api.getLedger({
      includeTransactions: true,
      includeAllData: true,
      ledgerVersion: 100000
    }).then(
      _.partial(checkResult, responses.getLedger.withPartial, 'getLedger'))
  })

  it('getLedger - full, then computeLedgerHash', () => {
    return this.api.getLedger({
      includeTransactions: true,
      includeState: true,
      includeAllData: true,
      ledgerVersion: 20
    }).then(_.partial(checkResult, responses.getLedger.full_20, 'getLedger'))
      .then(ledger => {
        const hash = this.api.computeLedgerHash(ledger)
        assert.strictEqual(
          hash,
          'A30B272536525AC410CC56D0E41258520CEF45EAABD2AB45D214BCDA869E1ECF'
        )
      })
  })


  it('computeLedgerHash - wrong hash', () => {
    return this.api.getLedger({
      includeTransactions: true,
      includeState: true,
      includeAllData: true,
      ledgerVersion: 20
    }).then(
      _.partial(
        checkResult,
        responses.getLedger.full_20,
        'getLedger')
    ).then(response => {
      const ledger = _.assign({}, response, {
        parentCloseTime: response.closeTime,
        stateHash: 'HEREANINVALIDSTATEHASH'
      })
      assert.throws(() => {
        const hash = this.api.computeLedgerHash(ledger)
        unused(hash)
      }, /does not match computed hash of state/)
    })

  })

  it('CasinocoinError with data', () => {
    const error = new this.api.errors.CasinocoinError('_message_', '_data_')
    assert.strictEqual(error.toString(),
      '[CasinocoinError(_message_, \'_data_\')]')
  })

  it('NotFoundError default message', () => {
    const error = new this.api.errors.NotFoundError()
    assert.strictEqual(error.toString(),
      '[NotFoundError(Not found)]')
  })

  it('common utils - toCasinocoindAmount', () => {
    assert.deepStrictEqual(utils.common.toCasinocoindAmount({
        issuer: 'is',
        currency: 'c',
        value: 'v'
      }),
      {
        issuer: 'is',
        currency: 'c',
        value: 'v'
      })
  })

  it('ledger utils - renameCounterpartyToIssuerInOrder', () => {
    const order = {
      taker_gets: {counterparty: '1', currency: 'CSC'},
      taker_pays: {counterparty: '1', currency: 'CSC'}
    }
    const expected = {
      taker_gets: {issuer: '1', currency: 'CSC'},
      taker_pays: {issuer: '1', currency: 'CSC'}
    }
    assert.deepStrictEqual(utils.renameCounterpartyToIssuerInOrder(order), expected)
  })

  // @TODO: fix KYC type and missing fixture properties
  // it('ledger utils - compareTransactions', () => {
  //   let first = {outcome: {ledgerVersion: 1, indexInLedger: 100}}
  //   let second = {outcome: {ledgerVersion: 1, indexInLedger: 200}}
  //
  //   assert.strictEqual(utils.compareTransactions(first, second), -1)
  //
  //   first = {outcome: {ledgerVersion: 1, indexInLedger: 100}}
  //   second = {outcome: {ledgerVersion: 1, indexInLedger: 100}}
  //
  //   assert.strictEqual(utils.compareTransactions(first, second), 0)
  //
  //   first = {outcome: {ledgerVersion: 1, indexInLedger: 200}}
  //   second = {outcome: {ledgerVersion: 1, indexInLedger: 100}}
  //
  //   assert.strictEqual(utils.compareTransactions(first, second), 1)
  // })

  // @TODO: Fix argument type for getRecursive method
  // it('ledger utils - getRecursive', () => {
  //   function getter(marker, limit) {
  //     return new Promise((resolve, reject) => {
  //       if (marker === undefined) {
  //         resolve({marker: 'A', limit: limit, results: [1]})
  //       } else {
  //         reject(new Error())
  //       }
  //     })
  //   }
  //
  //   return utils.getRecursive(getter, 10).then(() => {
  //     assert(false, 'Should throw Error')
  //   }).catch(error => {
  //     assert(error instanceof Error)
  //   })
  // })

  describe('schema-validator', () => {
    it('valid', () => {
      assert.doesNotThrow(() => {
        schemaValidator.schemaValidate('hash256',
          '0F7ED9F40742D8A513AE86029462B7A6768325583DF8EE21B7EC663019DD6A0F')
      })
    })
    //
    // it('invalid', function() => {
    //   return schemaValidator.schemaValidate(
    //   'hash256',
    //   'invalid'
    //   ).then(() => {
    //            assert(false, 'Should throw ValidationError')
    //          }).catch(error => {
    //
    //          })s
    //
    // })

    // it('invalid - empty value', function() => {
    //  return schemaValidator.schemaValidate('hash256', 'invalid').then(() => {
    //        assert(false, 'Should throw ValidationError')
    //      }).catch(error => {
    //          assert(error instanceof this.api.errors.ValidationError)
    //      })
    //
    // })
    //
    it('schema not found error', () => {
      assert.throws(() => {
        schemaValidator.schemaValidate('unexisting', 'anything')
      }, /no schema/)
    })

  })

  describe('validator', () => {


    it('validateLedgerRange', () => {
      const options = {
        minLedgerVersion: 20000,
        maxLedgerVersion: 10000
      }
      const thunk = _.partial(validate.getTransactions,
        {address, options})
      assert.throws(thunk, this.api.errors.ValidationError)
      assert.throws(thunk,
        /minLedgerVersion must not be greater than maxLedgerVersion/)
    })

    it('secret', () => {
      function validateSecret(secret) {
        validate.sign({txJSON: '', secret})
      }

      assert.doesNotThrow(_.partial(validateSecret,
        'snmFofi1NAkhiQHZy6uVoM7ZfPdac'))
      // assert.throws(_.partial(validateSecret,
      //     'snmFofi1NAkhiQHZy6uVoM7ZfPdac'), this.api.errors.ValidationError)
      assert.throws(_.partial(validateSecret, 1),
        this.api.errors.ValidationError)
      assert.throws(_.partial(validateSecret, ''),
        this.api.errors.ValidationError)
      assert.throws(_.partial(validateSecret, 's!!!'),
        this.api.errors.ValidationError)
      assert.throws(_.partial(validateSecret, 'passphrase'),
        this.api.errors.ValidationError)
      // 32 0s is a valid hex repr of seed bytes
      const hex = new Array(33).join('0')
      assert.throws(_.partial(validateSecret, hex),
        this.api.errors.ValidationError)
    })

  })

  it('ledger event', function (done) {
    this.api.on('ledger', message => {
      checkResult(responses.ledgerEvent, 'ledgerEvent', message)
      done()
    })
    closeLedger(this.api.connection)
  })

  describe('CasinocoinAPI - offline', () => {
    it('prepareSettings and sign', () => {
      const api = new CasinocoinAPI()

      return api.prepareSettings(
        'cJFdUxS3pcfUVzHdKTpnEnPNirEWRNW4UK',
        requests.prepareSettings.domain,
        {
          sequence: 23,
          maxLedgerVersion: 21,
          fee: '0.01'
        }
      ).then(data => {
        checkResult(responses.prepareSettings.flagsOffline, 'prepare', data)
        assert.deepStrictEqual(
          api.sign(
            data.txJSON,
            'shJZav5XuVk42N6m7wo15iVnJAJy3'
          ),
          responses.prepareSettings.signed
        )
      })
    })

    it('getServerInfo - offline', () => {
      const api = new CasinocoinAPI()
      return api.getServerInfo().then(() => {
        assert(false, 'Should throw error')
      }).catch(error => {
        assert(error instanceof api.errors.NotConnectedError)
      })
    })

    it('computeLedgerHash', () => {
      const api = new CasinocoinAPI()
      const header = requests.computeLedgerHash.header
      const ledgerHash = api.computeLedgerHash(header)
      assert.strictEqual(ledgerHash,
        '7853AB2AA2D7B0333390AB9D8F4E7E44A33D428E76A574D50BDFAE42B6B97970')
    })

    it('computeLedgerHash - incorrent transaction_hash', () => {
      const api = new CasinocoinAPI()
      const header = _.assign({}, requests.computeLedgerHash.header,
        {
          transactionHash:
            '325EACC5271322539EEEC2D6A5292471EF1B3E72AE7180533EFC3B8F0AD435C9'
        })
      header.rawTransactions = JSON.stringify(
        requests.computeLedgerHash.transactions)
      assert.throws(() => api.computeLedgerHash(header))
    })

    /* eslint-disable no-unused-vars */
    it('CasinocoinAPI - implicit server port', () => {
      const api = new CasinocoinAPI({server: 'wss://ws.casinocoin.org'})
      assert.equal(api._feeCushion, 1);
    })

    it('CasinocoinAPI valid options', () => {
      const api = new CasinocoinAPI({server: 'wss://s:1'})
      assert.deepStrictEqual(api.connection.getUrl, 'wss://s:1')
    })

    it('CasinocoinAPI invalid server uri', () => {
      assert.throws(() => new CasinocoinAPI({server: 'wss//s:1'}))
    })
  })

})

