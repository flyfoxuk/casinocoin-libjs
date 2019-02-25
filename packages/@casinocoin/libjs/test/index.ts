import * as assert from 'assert'
import {CasinocoinAPI} from '../src/index'

const api = new CasinocoinAPI({
  server: 'wss://moon.casinocoin.eu:6006'
})

describe('Casinocoin API Test', () => {

  it('Init Library', () => {
    console.log(api)
    assert.strictEqual(true, true)
  })

})
