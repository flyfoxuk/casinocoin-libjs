import * as assert from 'assert-diff'
import * as lib from '../src/api'
assert.options.strict = true

const api = new lib.CasinocoinAPI({
  server: 'wss://moon.casinocoin.eu:6006'
})

describe('Casinocoin API - Online Tests', () => {
  it('Check feeCushion', () => {
    assert.strictEqual(api._feeCushion, 1.2)
  })
})
