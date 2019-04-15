import WebSocket from "isomorphic-ws";
import { sleep } from "../util";

const PRODUCTION_ENDPOINT = "wss://ws.kraken.com";
const SANDBOX_ENDPOINT = "wss://ws-sandbox.kraken.com";
const KEEPALIVE_INTERVAL_MS = 15 * 1000;

interface Message {
  reqId?: number;
  pair: string[];
  subscription: {
    name: "ticker" | "ohlc" | "trade" | "book" | "spread" | "*";
    interval?: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;
    depth?: 10 | 25 | 100 | 500 | 1000;
  };
}

type Options = {
  sandbox?: boolean;
};

export class KrakenClient {
  private endpoint = SANDBOX_ENDPOINT;
  private ws?: WebSocket;

  private nextReqId = 1;

  private reqIdsTempMap: { [reqid: number]: any } = {};

  private handlers: {
    [channelID: string]: (x: any) => any;
  };

  constructor(options: Options) {
    this.endpoint = options.sandbox ? SANDBOX_ENDPOINT : PRODUCTION_ENDPOINT;
    this.handlers = {};
  }

  async pingPong() {
    const reqid = this.nextReqId++;

    return new Promise((res, rej) => {
      this.reqIdsTempMap[reqid] = (msg: any) => {
        delete this.reqIdsTempMap[reqid];
        res();
      };

      this.ws!.send(
        JSON.stringify({
          reqid,
          event: "ping",
        }),
      );
    });
  }

  async startKeepAliveLoop() {
    while (true) {
      await sleep(KEEPALIVE_INTERVAL_MS);
      if (this.ws!.readyState === WebSocket.OPEN) {
        const t0 = performance.now();
        await this.pingPong();
        const t1 = performance.now();
        console.log(`ponged after ${Math.floor(t1 - t0)} ms.`);
      }
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint);
      this.ws.onmessage = this.onMessage;
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
    if (data.reqid && this.reqIdsTempMap[data.reqid]) {
      this.reqIdsTempMap[data.reqid](data);
      return;
    }

    // Data message
    if (Array.isArray(data) && typeof data[0] === "number") {
      const reqId = data[0].toString();
      const handler = this.handlers[reqId];
      handler(data[1]);
    }
  };

  private subscribe = <T = any>(
    payload: Message,
    dataCallback: (data: T) => void,
    onSubscribeSuccess?: () => void,
  ) => {
    if (!this.ws) {
      throw new Error("WebSocket connection not established");
    }

    const reqid = this.nextReqId++;

    this.reqIdsTempMap[reqid] = (msg: any) => {
      this.handlers[msg.channelID] = dataCallback;

      delete this.reqIdsTempMap[reqid];
      onSubscribeSuccess && onSubscribeSuccess();
    };

    this.ws.send(
      JSON.stringify({
        ...payload,
        reqid,
        event: "subscribe",
      }),
    );

    // return an unsubscribe fn
    return () => {
      this.unsubscribe(payload);
    };
  };
  unsubscribe = (payload: Message) => {
    if (!this.ws) return;
    this.ws.send(
      JSON.stringify({
        ...payload,
        event: "unsubscribe",
      }),
    );
  };

  subscribeToOrderBook = (symbol: string, callback: (data: any) => void) => {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "book" },
    };

    const unsubscribe = this.subscribe(payload, callback);

    return unsubscribe;
  };

  subscribeToTrades = (
    symbol: string,
    callback: (data: Kraken.InboundMessages.Trade[]) => void,
  ): Promise<void> => {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "trade" },
    };

    return new Promise((res, rej) => {
      this.subscribe(
        payload,
        (data: Array<string[]>) => {
          const trades = data.map<Kraken.InboundMessages.Trade>(tradeArr => ({
            symbol,
            price: tradeArr[0],
            volume: tradeArr[1],
            time: tradeArr[2],
          }));
          callback(trades);
        },
        res,
      );
    });
  };
  unsubscribeTrades = (symbol: string) => {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "trade" },
    };
    return this.unsubscribe(payload);
  };
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
