import {CasinocoinAPI} from '../src/api'

const CasinocoinAPIBroadcast = require('../src/broadcast').CasinocoinAPIBroadcast
const ledgerClosed = require('./fixtures/casinocoind/ledger-close')
const createMockCasinocoind = require('./mock-casinocoind')
const {getFreePort} = require('./utils/net-utils')


function setupMockCasinocoindConnection(testcase, port) {
  return new Promise((resolve, reject) => {
    testcase.mockCasinocoind = createMockCasinocoind(port)
    testcase._mockedServerPort = port
    testcase.api = new CasinocoinAPI({server: 'ws://localhost:' + port})
    testcase.api.connect().then(() => {
      testcase.api.once('ledger', () => resolve())
      testcase.api.connection._ws.emit('message', JSON.stringify(ledgerClosed))
    }).catch(reject)
  })
}

function setupMockCasinocoindConnectionForBroadcast(testcase, ports) {
  return new Promise((resolve, reject) => {
    const servers = ports.map(port => 'ws://localhost:' + port)
    testcase.mocks = ports.map(port => createMockCasinocoind(port))
    testcase.api = new CasinocoinAPIBroadcast(servers)
    testcase.api.connect().then(() => {
      testcase.api.once('ledger', () => resolve())
      testcase.mocks[0].socket.send(JSON.stringify(ledgerClosed))
    }).catch(reject)
  })
}

function setup(): any {
  return getFreePort().then(port => {
    return setupMockCasinocoindConnection(this, port)
  })
}

function setupBroadcast(): any {
  return Promise.all([getFreePort(), getFreePort()]).then(ports => {
    return setupMockCasinocoindConnectionForBroadcast(this, ports)
  })
}

function teardown(done): any {
  this.api.disconnect().then(() => {
    if (this.mockCasinocoind !== undefined) {
      this.mockCasinocoind.close()
    } else {
      this.mocks.forEach(mock => mock.close())
    }
    setImmediate(done)
  }).catch(done)
}


export {
  teardown,
  setup,
  setupBroadcast,
  createMockCasinocoind
}
