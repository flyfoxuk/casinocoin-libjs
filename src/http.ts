import * as assert from "assert";
import * as _ from "lodash";
import * as jayson from "jayson";
import { CasinocoinAPI } from "./api";

/* istanbul ignore next */
function createHTTPServer(options: any, httpPort: number) {
  const casinocoinAPI = new CasinocoinAPI(options);

  const methodNames = _.filter(_.keys(CasinocoinAPI.prototype), (k: any) => {
    return typeof CasinocoinAPI.prototype[k] === "function" &&
      k !== "connect" &&
      k !== "disconnect" &&
      k !== "constructor" &&
      k !== "CasinocoinAPI";
  });

  function applyPromiseWithCallback(fnName: any, callback: any, funcArgs: any) {
    try {
      let args = funcArgs;
      if (!_.isArray(funcArgs)) {
        const fnParameters = jayson.Utils.getParameterNames(casinocoinAPI[fnName]);
        args = fnParameters.map((name: string) => funcArgs[name]);
        const defaultArgs = _.omit(funcArgs, fnParameters);
        assert(_.size(defaultArgs) <= 1,
          "Function must have no more than one default argument");
        if (_.size(defaultArgs) > 0) {
          args.push(defaultArgs[_.keys(defaultArgs)[0]]);
        }
      }
      Promise.resolve(casinocoinAPI[fnName](...args))
        .then((res) => callback(null, res))
        .catch((err) => {
          callback({ code: 99, message: err.message, data: { name: err.name } });
        });
    } catch (err) {
      callback({ code: 99, message: err.message, data: { name: err.name } });
    }
  }

  const methods: any = {};
  _.forEach(methodNames, (fn: string) => {
    methods[fn] = jayson.Method((args: any, cb: Function) => {
      applyPromiseWithCallback(fn, cb, args);
    }, { collect: true });
  });

  const server = jayson.server(methods);
  let httpServer: any = null;

  return {
    server,
    start: (): Promise<string | void> => {
      if (httpServer !== null) {
        return Promise.reject("Already started");
      }
      return new Promise((resolve) => {
        casinocoinAPI.connect().then(() => {
          httpServer = server.http();
          httpServer.listen(httpPort, resolve);
        });
      });
    },
    stop: (): Promise<string | void> => {
      if (httpServer === null) {
        return Promise.reject("Not started");
      }
      return new Promise((resolve) => {
        casinocoinAPI.disconnect();
        httpServer.close(() => {
          httpServer = null;
          resolve();
        });
      });
    },
  };
}

export {
  createHTTPServer,
};
