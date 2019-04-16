import WebSocket from "isomorphic-ws";
import { sleep, getDeferredPromise } from "../util";

const PRODUCTION_ENDPOINT = "wss://ws.kraken.com";
const SANDBOX_ENDPOINT = "wss://ws-sandbox.kraken.com";
const KEEPALIVE_INTERVAL_MS = 55 * 1000;

interface Message {
  reqId?: number;
  pair: string[];
  subscription: {
    name: "ticker" | "ohlc" | "trade" | "book" | "spread" | "*";
    interval?: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;
    depth?: 10 | 25 | 100 | 500 | 1000;
  };
}

type OutboundEventType = "ping" | "subscribe" | "unsubscribe";

type Options = {
  sandbox?: boolean;
};

export class KrakenClient {
  private endpoint = SANDBOX_ENDPOINT;
  private ws!: WebSocket;

  private _nextReqId = 0;
  private _runKeepAlive = false;

  private get nextReqId(): number {
    return ++this._nextReqId;
  }

  // private reqIdsTempMap: { [reqid: number]: any } = {};

  private handlers: {
    [channelID: string]: (x: any) => any;
  };

  constructor(options: Options) {
    this.endpoint = options.sandbox ? SANDBOX_ENDPOINT : PRODUCTION_ENDPOINT;
    this.handlers = {};
  }

  /**
   * Sends the payload to the websocket and resolves with the channel when the confirmation is received
   * @param payload payload
   * @param event event to send, or 'subscribe' by default
   * @returns A promise to be resolved with the channelID once received
   */
  private async sendRPC<TReturn = unknown, TPayload = any>(
    payload: TPayload,
    event: OutboundEventType = "subscribe",
  ): Promise<[number, TReturn]> {
    const requestReqId = this.nextReqId;
    const { promise, resolve, reject } = getDeferredPromise<[number, TReturn]>();

    const eventHandler = ({ data: rawData }: { data: WebSocket.Data }) => {
      const data = JSON.parse(rawData as string);
      if (!data || typeof data !== "object") {
        return; // Not my message
      }
      const { reqid: responseReqId, channelID, ...payload } = data;

      if (responseReqId === requestReqId) {
        this.ws.removeEventListener("message", eventHandler);
        if (payload.status === "error") {
          reject(payload);
        } else {
          resolve([channelID, payload]);
        }
      }
    };

    this.ws.send(
      JSON.stringify({
        reqid: requestReqId,
        event,
        ...payload,
      }),
    );
    this.ws.addEventListener("message", eventHandler);

    return promise;
  }

  async pingPong() {
    const [_, data] = await this.sendRPC<{ event: "pong" }>(null, "ping");
    if (data.event !== "pong") {
      throw Error("Pong not received!");
      debugger;
    }
    return;
  }

  async stopKeepAliveLoop() {
    this._runKeepAlive = false;
  }

  async startKeepAliveLoop() {
    this._runKeepAlive = true;
    while (this._runKeepAlive) {
      await sleep(KEEPALIVE_INTERVAL_MS);
      if (this.ws.readyState === WebSocket.OPEN) {
        const t0 = performance.now();
        await this.pingPong();
        const t1 = performance.now();
        console.log(`ponged after ${Math.floor(t1 - t0)} ms.`);
      }
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      (window as any).ws = this.ws = new WebSocket(this.endpoint);
      this.ws.addEventListener("message", this.onMessage);
      // this.ws.onmessage = this.onMessage;
      this.ws.onerror = ({ error, message }) => reject(`${message}\n${JSON.stringify(error)}`);
      this.ws.onclose = event => console.log(`Connection closed! Details:`, event);
      this.ws.onopen = ev => {
        console.log(`Connection opened!`, ev);
        resolve(ev);
        this.startKeepAliveLoop();
      };
    });
  }

  disconnect() {
    if (!this.ws) throw new Error("Already disconnected!");
    this.ws.close();
  }

  private messageBroker(event: any) {}

  private onMessage = ({ data: rawData }: { data: WebSocket.Data }) => {
    const data = JSON.parse(rawData as string);

    if (data && data.event === "heartbeat") return;

    // Subscription confirmation message
    // ! Now handled by sendRPC
    // if (data.reqid && this.reqIdsTempMap[data.reqid]) {
    //   this.reqIdsTempMap[data.reqid](data);
    //   return;
    // }

    // Data message
    if (Array.isArray(data) && typeof data[0] === "number") {
      const [channel, otherData] = data;
      const handler = this.handlers[channel];
      handler(otherData);
    }
  };

  private async subscribe<T = any>(payload: Message, onDataReceived: (data: T) => void) {
    if (!this.ws) {
      throw new Error("WebSocket connection not established");
    }

    try {
      const [channelID, response] = await this.sendRPC(payload, "subscribe");
      this.handlers[channelID] = onDataReceived;
      return true;
    } catch (err) {
      //TODO: log? reject? what!?
      return false;
    }
  }

  async unsubscribeByChannel(channelID: number) {
    const [_, confirmation] = await this.sendRPC<Kraken.InboundMessages.SubscriptionStatus>(
      { channelID },
      "unsubscribe",
    );
    if (confirmation.status === "unsubscribed") {
      delete this.handlers[channelID];
      // TODO: return promise and resolve/reject instead?
      return true;
    }
    return false;
  }

  async unsubscribeByPayload(payload: Message) {
    if (!this.ws) {
      throw new Error("WebSocket connection not established");
    }
    const [channelID, confirmation] = await this.sendRPC<Kraken.InboundMessages.SubscriptionStatus>(
      payload,
      "unsubscribe",
    );
    if (confirmation.status === "unsubscribed") {
      delete this.handlers[channelID];
      // TODO: return promise and resolve/reject instead?
      return true;
    }
    return false;
  }

  subscribeToOrderBook = (symbol: string, callback: (data: any) => void) => {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "book" },
    };

    const unsubscribe = this.subscribe(payload, callback);

    return unsubscribe;
  };

  subscribeToTrades(
    symbol: string,
    callback: (data: Kraken.InboundMessages.Trade[]) => void,
  ): Promise<boolean> {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "trade" },
    };

    return this.subscribe<Array<string[]>>(payload, data => {
      const trades = data.map<Kraken.InboundMessages.Trade>(tradeArr => ({
        symbol,
        price: tradeArr[0],
        volume: tradeArr[1],
        time: tradeArr[2],
      }));
      callback(trades);
    });
  }

  unsubscribeTrades(symbol: string) {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "trade" },
    };
    return this.unsubscribeByPayload(payload);
  }
}

export namespace Kraken {
  export namespace InboundMessages {
    export type Ping = {
      event: "ping";
      reqid?: number;
    };
    export type Pong = {
      event: "pong";
      reqid?: number;
    };

    export type Heartbeat = {
      event: "heartbeat";
    };

    export type SystemStatus = {
      event: "systemStatus";
      connectionID: number;
      status: "online" | "maintenance" | string;
      version: string;
    };

    export type SubscriptionStatus = {
      channelID: number;
      event: "subscriptionStatus";
      status: "subscribed" | "unsubscribed" | "error";
      pair: string;
      reqid?: number;
      subscription: {
        name: "ticker" | "ohlc" | "trade" | "book" | "spread" | "*";
        interval?: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;
        depth?: 10 | 25 | 100 | 500 | 1000;
      };
      errorMessage?: string;
    };

    export type LevelValue = [string, string, string]; // strings are floats
    export type OrderBookSnapshot = [
      number,
      {
        as: LevelValue[];
        bs: LevelValue[];
      }
    ];

    export interface Trade {
      symbol: string;
      time: string;
      price: string;
      volume: string;
    }

    export type OrderBookUpdate = [
      number,

      { a: LevelValue[] } | { b: LevelValue[] } | { a: LevelValue[]; b: LevelValue[] }
    ];

    export type InboundMessage =
      | Ping
      | Pong
      | OrderBookUpdate
      | OrderBookSnapshot
      | SystemStatus
      | SubscriptionStatus
      | Heartbeat;
  }
}
