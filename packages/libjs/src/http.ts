/* eslint-disable new-cap */

import * as _ from 'lodash'
import * as jayson from 'jayson'
import {CasinocoinAPI} from './api'


/* istanbul ignore next */
function createHTTPServer(options, httpPort) {
  const casinocoinAPI = new CasinocoinAPI(options)

  const methodNames = _.filter(_.keys(CasinocoinAPI.prototype), k => {
    return typeof CasinocoinAPI.prototype[k] === 'function'
    && k !== 'connect'
    && k !== 'disconnect'
    && k !== 'constructor'
    && k !== 'CasinocoinAPI'
  })

  function applyPromiseWithCallback(fnName, callback, args_) {
    try {
      let args = args_
      // if (!_.isArray(args_)) {
      //   const fnParameters = jayson.Utils.getParameterNames(
      //       casinocoinAPI[fnName]
      //   )
      //   args = fnParameters.map(name => args_[name])
      //   const defaultArgs = _.omit(args_, fnParameters)
      //   assert(_.size(defaultArgs) <= 1,
      //     'Function must have no more than one default argument')
      //   if (_.size(defaultArgs) > 0) {
      //     args.push(defaultArgs[_.keys(defaultArgs)[0]])
      //   }
      // }
      Promise.resolve(casinocoinAPI[fnName](...args))
        .then(res => callback(null, res))
        .catch(err => {
          callback({code: 99, message: err.message, data: {name: err.name}})
        })
    } catch (err) {
      callback({code: 99, message: err.message, data: {name: err.name}})
    }
  }

  const methods = {}
  _.forEach(methodNames, fn => {
    methods[fn] = new jayson.Method((args, cb) => {
      applyPromiseWithCallback(fn, cb, args)
    })
  })

  const server = new jayson.Server(methods)
  let httpServer = null

  return {
    server: server,
    start: function() {
      if (httpServer !== null) {
        return Promise.reject('Already started')
      }
      return new Promise(resolve => {
        casinocoinAPI.connect().then(() => {
          httpServer = server.http()
          httpServer.listen(httpPort, resolve)
        })
      })
    },
    stop: function() {
      if (httpServer === null) {
        return Promise.reject('Not started')
      }
      return new Promise(resolve => {
        casinocoinAPI.disconnect()
        httpServer.close(() => {
          httpServer = null
          resolve()
        })
      })
    }
  }
}

export {
  createHTTPServer
}
