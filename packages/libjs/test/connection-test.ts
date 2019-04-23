import * as _ from 'lodash'
import {assert} from 'assert-diff'
import {CasinocoinAPI} from '../src/api'
import * as setupApi from './setup-api'
// import * as net from 'net'

const utils = CasinocoinAPI._PRIVATE.ledgerUtils
const ledgerClose = require('./fixtures/casinocoind/ledger-close.json')


const TIMEOUT = 200000   // how long before each test case times out

function unused(param = null, anotherparam = null) {
  param.toString()
  anotherparam.toString()
}
// @TODO: belongs to test 'Connection' => 'with proxy'
// function createServer() {
//   return new Promise((resolve, reject) => {
//     const server = net.createServer()
//     server.on('listening', () => {
//       resolve(server)
//     })
//     server.on('error', function (error) {
//       reject(error)
//     })
//     server.listen(0, '0.0.0.0')
//   })
// }

describe('Connection', () => {
  this.timeout(TIMEOUT)


  beforeEach(setupApi.setupBroadcast)
  afterEach(setupApi.teardown)

  it('default options', () => {
    const connection = new utils.common.Connection('url')
    assert.strictEqual(connection.getUrl(), 'url')
    assert(_.isUndefined(connection.getProxyUrl()))
    assert(_.isUndefined(connection.getAuthorization()))
  })

  // @TODO: _console is private, can't set that
  // it('trace', () => {
  //   const connection = new utils.common.Connection('url', {trace: true})
  //   const message1 = '{'type': 'transaction'}'
  //   const message2 = '{'type': 'path_find'}'
  //   const messages = []
  //   connection._console = {
  //     log: function (message) {
  //       messages.push(message)
  //     }
  //   }
  //   connection._ws = {
  //     send: () => {
  //     }
  //   }
  //   connection._onMessage(message1)
  //   connection._send(message2)
  //
  //   assert.deepEqual(messages, [message1, message2])
  // })

  // @TODO: server has no mehtods in this case. needs to be fixed somehow
  // it('with proxy', done => {
  //   if (window) {
  //     done()
  //     return
  //   }
  //   createServer().then(server => {
  //     const port = server.address().port
  //     const expect = 'CONNECT localhost'
  //     server.on('connection', socket => {
  //       socket.on('data', data => {
  //         const got = data.toString('ascii', 0, expect.length)
  //         assert.strictEqual(got, expect)
  //         server.close()
  //         done()
  //       })
  //     })
  //
  //     const options = {
  //       proxy: 'ws://localhost:' + port,
  //       authorization: 'authorization',
  //       trustedCertificates: ['path/to/pem']
  //     }
  //     const connection =
  //       new utils.common.Connection(this.api.connection._url, options)
  //     connection.connect().catch(done)
  //     connection.connect().catch(done)
  //   }, done)
  // })

  it('Multiply disconnect calls', () => {
    this.api.disconnect()
    return this.api.disconnect()
  })

  it('reconnect', () => {
    return this.api.connection.reconnect()
  })

  it('NotConnectedError', () => {
    const connection = new utils.common.Connection('url')
    return connection.getLedgerVersion().then(() => {
      assert(false, 'Should throw NotConnectedError')
    }).catch(error => {
      assert(error instanceof this.api.errors.NotConnectedError)
    })
  })

  it('should throw NotConnectedError if server not responding ', function (
    done
  ) {
    if (window) {
      const phantomTest = /PhantomJS/
      if (phantomTest.test(navigator.userAgent)) {
        // inside PhantomJS this one just hangs, so skip as not very relevant
        done()
        return
      }
    }

    // Address where no one listens
    const connection =
      new utils.common.Connection('ws://testcasinocoin.circleci.com:129')
    connection.on('error', done)
    connection.connect().catch(error => {
      console.log(error)
      assert(error instanceof this.api.errors.NotConnectedError)
      done()
    })
  })

  it('DisconnectedError', () => {
    this.api.connection._send(JSON.stringify({
      command: 'config',
      data: {disconnectOnServerInfo: true}
    }))
    return this.api.getServerInfo().then(() => {
      assert(false, 'Should throw DisconnectedError')
    }).catch(error => {
      assert(error instanceof this.api.errors.DisconnectedError)
    })
  })

  it('TimeoutError', () => {
    this.api.connection._send = () => {
      return Promise.resolve({})
    }
    const request = {command: 'server_info'}
    return this.api.connection.request(request, 1).then(() => {
      assert(false, 'Should throw TimeoutError')
    }).catch(error => {
      assert(error instanceof this.api.errors.TimeoutError)
    })
  })

  it('DisconnectedError on send', () => {
    this.api.connection._ws.send = function (message, options, callback) {
      unused(message, options)
      callback({message: 'not connected'})
    }
    return this.api.getServerInfo().then(() => {
      assert(false, 'Should throw DisconnectedError')
    }).catch(error => {
      assert(error instanceof this.api.errors.DisconnectedError)
      assert.strictEqual(error.message, 'not connected')
    })
  })

  it('ResponseFormatError', () => {
    this.api.connection._send = function (message) {
      const parsed = JSON.parse(message)
      setTimeout(() => {
        this._ws.emit('message', JSON.stringify({
          id: parsed.id,
          type: 'response',
          status: 'unrecognized'
        }))
      }, 2)
      return new Promise(() => {
        // empty
      })
    }
    return this.api.getServerInfo().then(() => {
      assert(false, 'Should throw ResponseFormatError')
    }).catch(error => {
      assert(error instanceof this.api.errors.ResponseFormatError)
    })
  })

  it('reconnect on unexpected close ', done => {
    this.api.connection.on('connected', () => {
      done()
    })

    setTimeout(() => {
      this.api.connection._ws.close()
    }, 1)
  })

  describe('reconnection test', () => {
    beforeEach(() => {
      this.api.connection.__workingUrl = this.api.connection._url
      this.api.connection.__doReturnBad = () => {
        this._url = this.__badUrl
        const self = this

        function onReconnect(num) {
          if (num >= 2) {
            self._url = self.__workingUrl
            self.removeListener('reconnecting', onReconnect)
          }
        }

        this.on('reconnecting', onReconnect)
      }
    })

    afterEach(() => {
      // empty
    })

    it('reconnect on several unexpected close', done => {
      if (window) {
        const phantomTest = /PhantomJS/
        if (phantomTest.test(navigator.userAgent)) {
          // inside PhantomJS this one just hangs, so skip as not very relevant
          done()
          return
        }
      }
      this.timeout(70001)
      const self = this
      self.api.connection.__badUrl = 'ws://testcasinocoin.circleci.com:129'

      function breakConnection() {
        self.api.connection.__doReturnBad()
        self.api.connection._send(JSON.stringify({
          command: 'test_command',
          data: {disconnectIn: 10}
        }))
      }

      let connectsCount = 0
      let disconnectsCount = 0
      let reconnectsCount = 0
      let code = 0
      this.api.connection.on('reconnecting', () => {
        reconnectsCount += 1
      })
      this.api.connection.on('disconnected', _code => {
        code = _code
        disconnectsCount += 1
      })
      const num = 3
      this.api.connection.on('connected', () => {
        connectsCount += 1
        if (connectsCount < num) {
          breakConnection()
        }
        if (connectsCount === num) {
          if (disconnectsCount !== num) {
            done(new Error('disconnectsCount must be equal to ' + num +
              '(got ' + disconnectsCount + ' instead)'))
          } else if (reconnectsCount !== num * 2) {
            done(new Error('reconnectsCount must be equal to ' + num * 2 +
              ' (got ' + reconnectsCount + ' instead)'))
          } else if (code !== 1006) {
            done(new Error('disconnect must send code 1006 (got ' + code +
              ' instead)'))
          } else {
            done()
          }
        }
      })

      breakConnection()
    })
  })

  it('should emit disconnected event with code 1000 (CLOSE_NORMAL)',
    function (done
    ) {
      this.api.once('disconnected', code => {
        assert.strictEqual(code, 1000)
        done()
      })
      this.api.disconnect()
    })

  it('should emit disconnected event with code 1006 (CLOSE_ABNORMAL)',
    function (done
    ) {
      this.api.once('error', error => {
        done(new Error('should not throw error, got ' + String(error)))
      })
      this.api.once('disconnected', code => {
        assert.strictEqual(code, 1006)
        done()
      })
      this.api.connection._send(JSON.stringify({
        command: 'test_command',
        data: {disconnectIn: 10}
      }))
    })

  it('should emit connected event on after reconnect', done => {
    this.api.once('connected', done)
    this.api.connection._ws.close()
  })

  it('Multiply connect calls', () => {
    return this.api.connect().then(() => {
      return this.api.connect()
    })
  })

  it('hasLedgerVersion', () => {
    return this.api.connection.hasLedgerVersion(8819951).then(result => {
      assert(result)
    })
  })


  // @TODO: Should probably not test new instances without required parameters?
  // it('Cannot connect because no server', () => {
  //   const connection = new utils.common.Connection()
  //   return connection.connect().then(() => {
  //     assert(false, 'Should throw ConnectionError')
  //   }).catch(error => {
  //     assert(error instanceof this.api.errors.ConnectionError)
  //   })
  // })

  it('connect multiserver error', () => {
    const options = {
      servers: ['wss://server1.com', 'wss://server2.com']
    }
    assert.throws(() => {
      const api = new CasinocoinAPI(options)
      unused(api)
    }, this.api.errors.CasinocoinError)
  })

  it('connect throws error', done => {
    this.api.once('error', (type, info) => {
      assert.strictEqual(type, 'type')
      assert.strictEqual(info, 'info')
      done()
    })
    this.api.connection.emit('error', 'type', 'info')
  })

  it('emit stream messages', done => {
    let transactionCount = 0
    let pathFindCount = 0
    this.api.connection.on('transaction', () => {
      transactionCount++
    })
    this.api.connection.on('path_find', () => {
      pathFindCount++
    })
    this.api.connection.on('1', () => {
      assert.strictEqual(transactionCount, 1)
      assert.strictEqual(pathFindCount, 1)
      done()
    })

    this.api.connection._onMessage(JSON.stringify({
      type: 'transaction'
    }))
    this.api.connection._onMessage(JSON.stringify({
      type: 'path_find'
    }))
    this.api.connection._onMessage(JSON.stringify({
      type: 'response', id: 1
    }))
  })

  it('invalid message id', done => {
    this.api.on('error', (errorCode, errorMessage, message) => {
      assert.strictEqual(errorCode, 'badMessage')
      assert.strictEqual(errorMessage, 'valid id not found in response')
      assert.strictEqual(message,
        '{\'type\':\'response\',\'id\':\'must be integer\'}')
      done()
    })
    this.api.connection._onMessage(JSON.stringify({
      type: 'response', id: 'must be integer'
    }))
  })

  it('propagate error message', done => {
    this.api.on('error', (errorCode, errorMessage, data) => {
      assert.strictEqual(errorCode, 'slowDown')
      assert.strictEqual(errorMessage, 'slow down')
      assert.deepEqual(data, {error: 'slowDown', error_message: 'slow down'})
      done()
    })
    this.api.connection._onMessage(JSON.stringify({
      error: 'slowDown', error_message: 'slow down'
    }))
  })

  it('unrecognized message type', done => {
    this.api.on('error', (errorCode, errorMessage, message) => {
      assert.strictEqual(errorCode, 'badMessage')
      assert.strictEqual(errorMessage, 'unrecognized message type: unknown')
      assert.strictEqual(message, '{\'type\':\'unknown\'}')
      done()
    })

    this.api.connection._onMessage(JSON.stringify({type: 'unknown'}))
  })

  it('ledger close without validated_ledgers', done => {
    const message = _.omit(ledgerClose, 'validated_ledgers')
    this.api.on('ledger', function (ledger) {
      assert.strictEqual(ledger.ledgerVersion, 8819951)
      done()
    })
    this.api.connection._ws.emit('message', JSON.stringify(message))
  })

  it('should throw CasinocoindNotInitializedError if server does not have ' +
    'validated ledgers',
    () => {
      this.timeout(3000)

      this.api.connection._send(JSON.stringify({
        command: 'global_config',
        data: {returnEmptySubscribeRequest: 1}
      }))

      const api = new CasinocoinAPI({server: this.api.connection._url})
      return api.connect().then(() => {
        assert(false, 'Must have thrown!')
      }, error => {
        assert(error instanceof this.api.errors.CasinocoindNotInitializedError,
          'Must throw CasinocoindNotInitializedError, got instead '
          + String(error)
        )
      })
    })

  it('should try to reconnect on empty subscribe response on reconnect',
    done => {
      this.timeout(23000)

      this.api.on('error', error => {
        done(error || new Error('Should not emit error.'))
      })
      let disconncedCount = 0
      this.api.on('connected', () => {
        done(disconncedCount !== 1 ?
          new Error('Wrong number of disconnects') : undefined)
      })
      this.api.on('disconnected', () => {
        disconncedCount++
      })

      this.api.connection._send(JSON.stringify({
        command: 'global_config',
        data: {returnEmptySubscribeRequest: 3}
      }))

      this.api.connection._send(JSON.stringify({
        command: 'test_command',
        data: {disconnectIn: 10}
      }))
    })
})
