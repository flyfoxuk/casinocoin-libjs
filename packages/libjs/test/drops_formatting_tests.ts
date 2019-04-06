import * as _ from 'lodash'
import {assert} from 'assert-diff'

import {CasinocoinAPI} from '../src/api'
import * as setupApi from './setup-api'

const fixtures = require('./fixtures')
const requests = fixtures.requests
const responses = fixtures.responses
const addresses = require('./fixtures/addresses')
const address = addresses.ACCOUNT
const schemaValidator = CasinocoinAPI._PRIVATE.schemaValidator
assert.options.strict = true

// how long before each test case times out
const TIMEOUT = window ? 25000 : 10000


function checkResult(expected, schemaName, response) {
  if (expected.txJSON) {
    assert(response.txJSON)
    assert.deepStrictEqual(
      JSON.parse(response.txJSON),
      JSON.parse(expected.txJSON)
    )
  }
  assert.deepStrictEqual(
    _.omit(response, 'txJSON'),
    _.omit(expected, 'txJSON')
  )
  if (schemaName) {
    schemaValidator.schemaValidate(schemaName, response)
  }
  return response
}


describe('CasinocoinAPI', function () {
  this.timeout(TIMEOUT)
  const instructions = {maxLedgerVersionOffset: 100}
  beforeEach(setupApi.setup)
  afterEach(setupApi.teardown)

  it('prepareTrustline - simple', function () {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.simple, instructions).then(
      _.partial(checkResult, responses.prepareTrustline.simple, 'prepare')
    )
  })

  it('prepareTrustline - frozen', function () {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.frozen).then(
      _.partial(checkResult, responses.prepareTrustline.frozen, 'prepare'))
  })

  it('prepareTrustline - complex', function () {
    return this.api.prepareTrustline(
      address, requests.prepareTrustline.complex, instructions).then(
      _.partial(checkResult, responses.prepareTrustline.complex, 'prepare'))
  })

  it('prepareSettings', function () {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, instructions).then(
      _.partial(checkResult, responses.prepareSettings.flags, 'prepare'))
  })

  it('prepareSettings - no maxLedgerVersion', function () {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain, {maxLedgerVersion: null}).then(
      _.partial(checkResult, responses.prepareSettings.noMaxLedgerVersion,
        'prepare'))
  })

  it('prepareSettings - no instructions', function () {
    return this.api.prepareSettings(
      address, requests.prepareSettings.domain).then(
      _.partial(
        checkResult,
        responses.prepareSettings.noInstructions,
        'prepare'))
  })

  it('prepareSettings - regularKey', function () {
    const regularKey = {regularKey: 'cQw6KZ7CyvNmdBtjfdj15puULG3rCBXXvV'}
    return this.api.prepareSettings(address, regularKey, instructions).then(
      _.partial(checkResult, responses.prepareSettings.regularKey, 'prepare'))
  })

})
