import * as _ from 'lodash'
import {assert} from 'assert-diff'
import * as setupApi from './setup-api'
import {CasinocoinAPI} from '../src/api'

const responses = require('./fixtures').responses
const ledgerClosed = require('./fixtures/casinocoind/ledger-close')
const schemaValidator = CasinocoinAPI._PRIVATE.schemaValidator

const TIMEOUT = window ? 25000 : 10000

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

describe('CasinocoinAPIBroadcast', function() {
  this.timeout(TIMEOUT)

  beforeEach(setupApi.setupBroadcast)
  afterEach(setupApi.teardown)

  it('base', function() {
    const expected = {request_server_info: 1}
    if (!window) {
      this.mocks.forEach(mock => mock.expect(_.assign({}, expected)))
    }
    assert(this.api.isConnected())
    return this.api.getServerInfo().then(
      _.partial(checkResult, responses.getServerInfo, 'getServerInfo'))
  })

  it('ledger', function(done) {
    let gotLedger = 0
    this.api.on('ledger', () => {
      gotLedger++
    })
    const ledgerNext = _.assign({}, ledgerClosed)
    ledgerNext.ledger_index++

    this.api._apis.forEach(api => api.connection._send(JSON.stringify({
      command: 'echo',
      data: ledgerNext
    })))

    setTimeout(() => {
      assert.strictEqual(gotLedger, 1)
      done()
    }, 1250)
  })

  it('error propagation', function(done) {
    this.api.once('error', (type, info) => {
      assert.strictEqual(type, 'type')
      assert.strictEqual(info, 'info')
      done()
    })
    this.api._apis[1].connection._send(JSON.stringify({
      command: 'echo',
      data: {error: 'type', error_message: 'info'}
    }))
  })

})
