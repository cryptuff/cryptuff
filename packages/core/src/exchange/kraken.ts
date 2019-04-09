import WebSocket from "isomorphic-ws";

const PRODUCTION_ENDPOINT = "wss://ws.kraken.com";
const SANDBOX_ENDPOINT = "wss://ws-sandbox.kraken.com";

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

  private handlers: {
    [id: string]: (x: any) => any;
  };

  constructor(options: Options) {
    this.endpoint = options.sandbox ? SANDBOX_ENDPOINT : PRODUCTION_ENDPOINT;
    this.handlers = {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint);
      this.ws.onmessage = this.onMessage;
      this.ws.onopen = ev => {
        resolve(ev);
      };
    });
  }

  private messageBroker(event: any) {}

  private onMessage = (event: any) => {
    // console.log("ws message:", event);
    const data = JSON.parse(event.data);
    if (data && data.event === "heartbeat") return;
    if (data.reqid && this.reqIdsTempMap[data.reqid]) {
      this.reqIdsTempMap[data.reqid](data);
      return;
    }
    if (Array.isArray(data) && typeof data[0] === "number") {
      const handler = this.handlers[data[0].toString()];
      this.handlers[`${data[0]}`](data[1]);
    }
  };

  reqIdsTempMap: { [reqid: number]: any } = {};

  private subscribe = (payload: Message, cb: (...data: any) => void) => {
    if (!this.ws) {
      throw new Error("WebSocket connection not established");
    }

    const reqid = this.nextReqId++;

    this.reqIdsTempMap[reqid] = (msg: any) => {
      this.handlers[msg.channelID] = cb;

      delete this.reqIdsTempMap[reqid];
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

    this.subscribe(payload, callback);

    return () => {
      this.unsubscribe({
        pair: [symbol],
        subscription: {
          name: "book",
        },
      });
    };
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
