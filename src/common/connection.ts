import * as _ from "lodash";
import { EventEmitter } from "events";
import {
  CasinocoindError,
  CasinocoindNotInitializedError,
  ConnectionError,
  DisconnectedError,
  NotConnectedError,
  ResponseFormatError,
  TimeoutError,
} from "./errors";
import { parse as parseUrl } from "url";
import * as WebSocket from "ws";
import RangeSet from "./rangeset";

function isStreamMessageType(type: string) {
  return type === "ledgerClosed" ||
    type === "transaction" ||
    type === "path_find";
}

export type ConnectionOptions = {
  authorization?: string,
  certificate?: string,
  key?: string,
  trustedCertificates?: string[],
  proxy?: string,
  proxyAuthorization?: string,
  passphrase?: string,
  timeout?: number,
  trace?: boolean,
};

class Connection extends EventEmitter {

  private url: string;
  private trace: boolean;
  private console?: Console;
  private proxyURL?: string;
  private proxyAuthorization?: string;
  private authorization?: string;
  private trustedCertificates?: string[];
  private key?: string;
  private passphrase?: string;
  private certificate?: string;
  private timeout: number;
  private isReady: boolean = false;
  private ws: WebSocket | null;
  private ledgerVersion: null | number;
  private availableLedgerVersions = new RangeSet();
  private nextRequestID: number = 1;
  private retry: number = 0;
  private retryTimer: null | NodeJS.Timer = null;
  private onOpenErrorBound: null | ((...args: any[]) => void) = null;
  private onUnexpectedCloseBound: null | ((...args: any[]) => void) = null;
  private feeBase: null | number = null;
  private feeRef: null | number = null;

  constructor(url: string, options: ConnectionOptions = {}) {
    super();
    this.setMaxListeners(Infinity);
    this.url = url;
    this.trace = options.trace || false;
    if (this.trace) {
      // for easier unit testing
      this.console = console;
    }
    this.proxyURL = options.proxy;
    this.proxyAuthorization = options.proxyAuthorization;
    this.authorization = options.authorization;
    this.trustedCertificates = options.trustedCertificates;
    this.key = options.key;
    this.passphrase = options.passphrase;
    this.certificate = options.certificate;
    this.timeout = options.timeout || (20 * 1000);
    this.isReady = false;
    this.ws = null;
    this.ledgerVersion = null;
    this.availableLedgerVersions = new RangeSet();
    this.nextRequestID = 1;
    this.retry = 0;
    this.retryTimer = null;
    this.onOpenErrorBound = null;
    this.onUnexpectedCloseBound = null;
    this.feeBase = null;
    this.feeRef = null;
  }

  public isConnected() {
    return this.state === WebSocket.OPEN && this.isReady;
  }

  public retryConnect() {
    this.retry += 1;
    const retryTimeout = this.calculateTimeout(this.retry);
    this.retryTimer = setTimeout(() => {
      this.emit("reconnecting", this.retry);
      this.connect().catch(this.retryConnect.bind(this));
    }, retryTimeout);
  }

  public connect() {
    this.clearReconnectTimer();
    return new Promise((resolve, reject) => {
      if (!this.url) {
        reject(new ConnectionError(
          "Cannot connect because no server was specified"));
      }
      if (this.state === WebSocket.OPEN) {
        resolve();
      } else if (this.state === WebSocket.CONNECTING) {
        if (this.ws !== null) {
          this.ws.once("open", resolve);
        }
      } else {
        this.ws = this.createWebSocket();
        // when an error causes the connection to close, the close event
        // should still be emitted; the "ws" documentation says: "The close
        // event is also emitted when then underlying net.Socket closes the
        // connection (end or close)."
        // In case if there is connection error (say, server is not responding)
        // we must return this error to connection"s caller. After successful
        // opening, we will forward all errors to main api object.
        this.onOpenErrorBound = this.onOpenError.bind(this, reject);
        if (this.onOpenErrorBound !== null) {
          this.ws.once("error", this.onOpenErrorBound);
        }
        this.ws.on("message", this.onMessage.bind(this));

        // in browser close event can came before open event, so we must
        // resolve connect"s promise after reconnect in that case.
        // after open event we will rebound onUnexpectedCloseBound
        // without resolve and reject functions
        this.onUnexpectedCloseBound = this.onUnexpectedClose.bind(this, true,
          resolve, reject);
        if (this.onUnexpectedCloseBound !== null) {
          this.ws.once("close", this.onUnexpectedCloseBound);
        }
        this.ws.once("open", () => this.onOpen().then(resolve, reject));
      }
    });
  }

  public onOpenError(reject: any, error: Error) {
    this.onOpenErrorBound = null;
    this.unbindOnUnxpectedClose();
    reject(new NotConnectedError(error && error.message));
  }

  public disconnect() {
    return this._disconnect(true);
  }

  public _disconnect(calledByUser: any) {
    if (calledByUser) {
      this.clearReconnectTimer();
      this.retry = 0;
    }
    return new Promise((resolve) => {
      if (this.state === WebSocket.CLOSED) {
        resolve();
      } else if (this.state === WebSocket.CLOSING && this.ws !== null) {
        this.ws.once("close", resolve);
      } else {
        if (this.onUnexpectedCloseBound && this.ws !== null) {
          this.ws.removeListener("close", this.onUnexpectedCloseBound);
          this.onUnexpectedCloseBound = null;
        }
        if (this.ws !== null) {
          this.ws.once("close", (code) => {
            this.ws = null;
            this.isReady = false;
            if (calledByUser) {
              this.emit("disconnected", code || 1000); // 1000 - CLOSE_NORMAL
            }
            resolve();
          });
          this.ws.close();
        }
      }
    });
  }

  public reconnect() {
    return this.disconnect().then(() => this.connect());
  }

  public getLedgerVersion(): Promise<number> {
    return this.whenReady(Promise.resolve(this.ledgerVersion!));
  }

  public hasLedgerVersions(lowLedgerVersion: number, highLedgerVersion: number): Promise<boolean> {
    return this.whenReady(Promise.resolve(
      this.availableLedgerVersions.containsRange(
        lowLedgerVersion,
        this.ledgerVersion !== null ? this.ledgerVersion : highLedgerVersion)));
  }

  public hasLedgerVersion(ledgerVersion: number): Promise<boolean> {
    return this.hasLedgerVersions(ledgerVersion, ledgerVersion);
  }

  public getFeeBase(): Promise<number> {
    return this.whenReady(Promise.resolve(Number(this.feeBase)));
  }

  public getFeeRef(): Promise<number> {
    return this.whenReady(Promise.resolve(Number(this.feeRef)));
  }

  public request(request: any, timeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.shouldBeConnected) {
        reject(new NotConnectedError());
      }

      let timer: any = null;
      const self = this;
      const id = this.nextRequestID;
      this.nextRequestID += 1;
      const eventName = id.toString();

      function onDisconnect() {
        clearTimeout(timer);
        self.removeAllListeners(eventName);
        reject(new DisconnectedError());
      }

      function cleanup() {
        clearTimeout(timer);
        self.removeAllListeners(eventName);
        if (self.ws !== null) {
          self.ws.removeListener("close", onDisconnect);
        }
      }

      function _resolve(response: any) {
        cleanup();
        resolve(response);
      }

      function _reject(error: any) {
        cleanup();
        reject(error);
      }

      this.once(eventName, (response) => {
        if (response.status === "error") {
          _reject(new CasinocoindError(response.error));
        } else if (response.status === "success") {
          _resolve(response.result);
        } else {
          _reject(new ResponseFormatError(
            "unrecognized status: " + response.status));
        }
      });

      if (this.ws !== null) {
        this.ws.once("close", onDisconnect);
      }

      // JSON.stringify automatically removes keys with value of "undefined"
      const message = JSON.stringify(Object.assign({}, request, { id }));

      this.whenReady(this.send(message)).then(() => {
        const delay = timeout || this.timeout;
        timer = setTimeout(() => _reject(new TimeoutError()), delay);
      }).catch(_reject);
    });
  }

  private updateLedgerVersions(data: any) {
    this.ledgerVersion = Number(data.ledger_index);
    if (data.validated_ledgers) {
      this.availableLedgerVersions.reset();
      this.availableLedgerVersions.parseAndAddRanges(
        data.validated_ledgers);
    } else {
      this.availableLedgerVersions.addValue(this.ledgerVersion);
    }
  }

  private updateFees(data: any) {
    this.feeBase = Number(data.fee_base);
    this.feeRef = Number(data.fee_ref);
  }

  // return value is array of arguments to Connection.emit
  private parseMessage(message: string):
  [string, object] | ["error", string, string, object] {
    const data = JSON.parse(message);
    if (data.type === "response") {
      if (!(Number.isInteger(data.id) && data.id >= 0)) {
        throw new ResponseFormatError("valid id not found in response");
      }
      return [data.id.toString(), data];
    } else if (isStreamMessageType(data.type)) {
      if (data.type === "ledgerClosed") {
        this.updateLedgerVersions(data);
        this.updateFees(data);
      }
      return [data.type, data];
    } else if (data.type === undefined && data.error) {
      return ["error", data.error, data.error_message, data]; // e.g. slowDown
    }
    throw new ResponseFormatError("unrecognized message type: " + data.type);
  }

  private onMessage(message: string) {
    if (this.trace) {
      this.console!.log(message);
    }
    let parameters;
    try {
      parameters = this.parseMessage(message);
    } catch (error) {
      this.emit("error", "badMessage", error.message, message);
      return;
    }
    // we don"t want this inside the try/catch or exceptions in listener
    // will be caught
    this.emit.apply(this, parameters);
  }

  get state(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  get shouldBeConnected(): boolean {
    return this.ws !== null;
  }

  private onUnexpectedClose(
    beforeOpen: boolean,
    resolve: any,
    reject: any,
    code: any,
  ) {
    if (this.onOpenErrorBound) {
      this.ws!.removeListener("error", this.onOpenErrorBound);
      this.onOpenErrorBound = null;
    }
    // just in case
    this.ws!.removeAllListeners("open");
    this.ws = null;
    this.isReady = false;
    if (beforeOpen) {
      // connection was closed before it was properly opened, so we must return
      // error to connect"s caller
      this.connect().then(resolve, reject);
    } else {
      // if first parameter ws lib sends close code,
      // but sometimes it forgots about it, so default to 1006 - CLOSE_ABNORMAL
      this.emit("disconnected", code || 1006);
      this.retryConnect();
    }
  }

  private calculateTimeout(retriesCount: number) {
    return (retriesCount < 40)
      // First, for 2 seconds: 20 times per second
      ?
      (1000 / 20) :
      (retriesCount < 40 + 60)
        // Then, for 1 minute: once per second
        ?
        (1000) :
        (retriesCount < 40 + 60 + 60)
          // Then, for 10 minutes: once every 10 seconds
          ?
          (10 * 1000)
          // Then: once every 30 seconds
          :
          (30 * 1000);
  }

  private clearReconnectTimer() {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private onOpen(): Promise<DisconnectedError|CasinocoindNotInitializedError> {
    if (!this.ws) {
      return Promise.reject(new DisconnectedError());
    }
    if (this.onOpenErrorBound) {
      this.ws.removeListener("error", this.onOpenErrorBound);
      this.onOpenErrorBound = null;
    }

    const request = {
      command: "subscribe",
      streams: ["ledger"],
    };

    return this.request(request).then((data: any) => {
      if (_.isEmpty(data) || !data.ledger_index) {
        // casinocoind instance doesn"t have validated ledgers
        return this._disconnect(false).then(() => {
          throw new CasinocoindNotInitializedError("Casinocoind not initialized");
        });
      }

      this.updateLedgerVersions(data);
      this.updateFees(data);
      this.rebindOnUnxpectedClose();

      this.retry = 0;
      if (this.ws !== null) {
        this.ws.on("error", (error: any) => {
          // TODO: "type" does not exist on official error type, safe to remove?
          // Ref: https://github.com/ripple/ripple-lib/pull/816/files#diff-0a9280b79cd764365023957c8532526c
          if (typeof window !== "undefined" && error && (error).type === "error") {
            // we are in browser, ignore error - `close` event will be fired
            // after error
            return;
          }
          this.emit("error", "websocket", error.message, error);
        });
      }

      this.isReady = true;
      this.emit("connected");

      return;
    });
  }

  private rebindOnUnxpectedClose() {
    if (this.onUnexpectedCloseBound && this.ws !== null) {
      this.ws.removeListener("close", this.onUnexpectedCloseBound);
    }
    this.onUnexpectedCloseBound = this.onUnexpectedClose.bind(
      this,
      false,
      null,
      null,
    );
    if (this.ws !== null && this.onUnexpectedCloseBound !== null) {
      this.ws.once("close", this.onUnexpectedCloseBound);
    }
  }

  private unbindOnUnxpectedClose() {
    if (this.onUnexpectedCloseBound && this.ws !== null) {
      this.ws.removeListener("close", this.onUnexpectedCloseBound);
    }
    this.onUnexpectedCloseBound = null;
  }

  private createWebSocket(): WebSocket {
    const options: WebSocket.ClientOptions = {};
    if (this.proxyURL !== undefined) {
      const parsedURL = parseUrl(this.url);
      const parsedProxyURL = parseUrl(this.proxyURL);
      const proxyOverrides = _.omit({
        auth: this.proxyAuthorization,
        ca: this.trustedCertificates,
        cert: this.certificate,
        key: this.key,
        passphrase: this.passphrase,
        secureEndpoint: (parsedURL.protocol === "wss:"),
        secureProxy: (parsedProxyURL.protocol === "https:"),
      }, _.isUndefined); // TODO: What is undefined here?
      const proxyOptions = _.assign({}, parsedProxyURL, proxyOverrides);
      let HttpsProxyAgent;
      try {
        HttpsProxyAgent = require("https-proxy-agent");
      } catch (error) {
        throw new Error("'proxy' option is not supported in the browser");
      }
      options.agent = new HttpsProxyAgent(proxyOptions);
    }
    if (this.authorization !== undefined) {
      const base64 = new Buffer(this.authorization).toString("base64");
      options.headers = { Authorization: `Basic ${base64}` };
    }
    const optionsOverrides = _.omit({
      ca: this.trustedCertificates,
      cert: this.certificate,
      key: this.key,
      passphrase: this.passphrase,
    }, _.isUndefined); // TODO: What is undefined here?
    const websocketOptions = _.assign({}, options, optionsOverrides);
    const websocket = new WebSocket(this.url, undefined, websocketOptions);
    // we will have a listener for each outstanding request,
    // so we have to raise the limit (the default is 10)
    if (typeof websocket.setMaxListeners === "function") {
      websocket.setMaxListeners(Infinity);
    }
    return websocket;
  }

  private whenReady<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.shouldBeConnected) {
        reject(new NotConnectedError());
      } else if (this.state === WebSocket.OPEN && this.isReady) {
        promise.then(resolve, reject);
      } else {
        this.once("connected", () => promise.then(resolve, reject));
      }
    });
  }

  private send(message: any): Promise<void> {
    if (this.trace && this.console !== undefined) {
      this.console.log(message);
    }
    return new Promise((resolve, reject) => {
      if (this.ws !== null) {
        // original value -> undefined
        this.ws.send(message, {}, (error: any) => {
          if (error) {
            reject(new DisconnectedError(error.message));
          } else {
            resolve();
          }
        });
      }
    });
  }

}

export default Connection;
