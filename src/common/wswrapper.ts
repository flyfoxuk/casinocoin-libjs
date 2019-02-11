import { EventEmitter } from "events";

// Define the global WebSocket class found on the native browser
declare class WebSocket {

  public onclose?: () => any;
  public onopen?: () => any;
  public onerror?: (error: any) => any;
  public onmessage?: (message: any) => any;
  public readyState: number;
  constructor(url: string);
  public close(): any;
  public send(message: string): any;

}

/**
 * Provides `EventEmitter` interface for native browser `WebSocket`,
 * same, as `ws` package provides.
 */
export class WSWrapper extends EventEmitter {

  public static CONNECTING = 0;
  public static OPEN = 1;
  public static CLOSING = 2;
  public static CLOSED = 3;
  private ws: WebSocket;

  constructor(url: any, protocols: any, websocketOptions: any) {
    super();
    this.setMaxListeners(Infinity);
    this.ws = new WebSocket(url);

    this.ws.onclose = () => {
      this.emit("close");
    };

    this.ws.onopen = () => {
      this.emit("open");
    };

    this.ws.onerror = (error) => {
      this.emit("error", error);
    };

    this.ws.onmessage = (message) => {
      this.emit("message", message.data);
    };
  }

  public close() {
    if (this.readyState === 1) {
      this.ws.close();
    }
  }

  public send(message: any) {
    this.ws.send(message);
  }

  get readyState() {
    return this.ws.readyState;
  }

}

WSWrapper.CONNECTING = 0;
WSWrapper.OPEN = 1;
WSWrapper.CLOSING = 2;
WSWrapper.CLOSED = 3;
