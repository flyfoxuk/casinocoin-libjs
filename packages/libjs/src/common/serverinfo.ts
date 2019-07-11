import * as _ from 'lodash'
import {convertKeysFromSnakeCaseToCamelCase} from './utils'
import Connection from './connection'

export type GetServerInfoResponse = {
  buildVersion: string,
  completeLedgers: string,
  hostID: string,
  ioLatencyMs: number,
  load?: {
    jobTypes: Array<Object>,
    threads: number
  },
  lastClose: {
    convergeTimeS: number,
    proposers: number
  },
  loadFactor: number,
  peers: number,
  pubkeyNode: string,
  pubkeyValidator?: string,
  serverState: string,
  validatedLedger: {
    age: number,
    baseFeeCSC: string,
    hash: string,
    reserveBaseCSC: string,
    reserveIncrementCSC: string,
    ledgerVersion: number
  },
  validationQuorum: number
}

function renameKeys(object, mapping) {
  _.forEach(mapping, (to, from) => {
    object[to] = object[from]
    delete object[from]
  })
}

function getServerInfo(connection: Connection): Promise<GetServerInfoResponse> {
  return connection.request({command: 'server_info'}).then(response => {
    const info = convertKeysFromSnakeCaseToCamelCase(response.info)
    renameKeys(info, {hostid: 'hostID'})
    if (info.validatedLedger) {
      renameKeys(info.validatedLedger, {
        baseFeeCsc: 'baseFeeCSC',
        reserveBaseCsc: 'reserveBaseCSC',
        reserveIncCsc: 'reserveIncrementCSC',
        seq: 'ledgerVersion'
      })
      info.validatedLedger.baseFeeCSC =
        info.validatedLedger.baseFeeCSC.toString()
      info.validatedLedger.reserveBaseCSC =
        info.validatedLedger.reserveBaseCSC.toString()
      info.validatedLedger.reserveIncrementCSC =
        info.validatedLedger.reserveIncrementCSC.toString()
    }
    return info
  })
}

// TODO: This was originally annotated to return a number, but actually
// returned a toString'ed number. Should this actually be returning a number?
function computeFeeFromServerInfo(cushion: number,
  serverInfo: GetServerInfoResponse
): string {
  return (Number(serverInfo.validatedLedger.baseFeeCSC)
       * Number(serverInfo.loadFactor) * cushion).toString()
}

function getFee(connection: Connection, cushion: number): Promise<string> {
  return getServerInfo(connection).then(serverInfo => {
    return computeFeeFromServerInfo(cushion, serverInfo)
  })
}

export {
  getServerInfo,
  getFee
}
