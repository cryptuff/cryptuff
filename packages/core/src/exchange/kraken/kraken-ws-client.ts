import WebSocket from "isomorphic-ws";
import { sleep, getDeferredPromise } from "../../util";
import { MarketTrade, OrderBookSnapshot, OrderBookDeltaSet } from "src/models";
import { timestampToMilliseconds } from "../../util";
import { RequireAtLeastOne } from "../../util/typeUtils";

const PRODUCTION_ENDPOINT = "wss://ws.kraken.com";
const SANDBOX_ENDPOINT = "wss://ws-sandbox.kraken.com";
const KEEPALIVE_INTERVAL_MS = 55 * 1000;

const logger = {
  log: console.log.bind(console),
  error: console.error.bind(console),
};

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

type ConnectionStatus = "connecting" | "connected" | "closing" | "closed" | "unknown";

type Options = {
  sandbox?: boolean;
};

export class KrakenWSClient {
  private endpoint = SANDBOX_ENDPOINT;
  private ws!: WebSocket;

  private _nextReqId = 0;
  private _runKeepAlive = false;
  private _lastHeartbeatReceived = 0;

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

  public get connectionStatus(): ConnectionStatus {
    if (!this.ws) return "unknown";
    switch (this.ws.readyState) {
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "closed";
    }
    return "unknown";
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
      debugger;
      throw Error("Pong not received!");
    }
    return;
  }

  async stopKeepAliveLoop() {
    this._runKeepAlive = false;
  }

  async startKeepAliveLoop() {
    if (this._runKeepAlive) return;

    this._runKeepAlive = true;
    while (this._runKeepAlive) {
      await sleep(KEEPALIVE_INTERVAL_MS);
      if (this.connectionStatus === "connected") {
        const t0 = performance.now();
        await this.pingPong();
        const t1 = performance.now();
        logger.log(`ponged after ${Math.floor(t1 - t0)} ms.`);
      }
    }
  }

  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.connectionStatus === "connected") {
        return resolve();
      }
      if (this.connectionStatus === "connecting") {
        // Wait for connection and retry
        await sleep(100);
        return this.connect();
      }
      (window as any).ws = this.ws = new WebSocket(this.endpoint);
      this.ws.addEventListener("message", this.onMessage);
      this.ws.onerror = ({ error, message }) => reject(`${message}\n${JSON.stringify(error)}`);
      this.ws.onclose = event => logger.log(`Connection closed! Details:`, event);
      this.ws.onopen = ev => {
        logger.log(`Connection opened!`, ev);
        resolve();
        this.startKeepAliveLoop();
      };
    });
  }

  disconnect() {
    if (!this.ws) {
      throw new Error(`websocket object is ${this.ws}!`);
    }
    if (this.connectionStatus !== "connected") {
      return this.connectionStatus;
    }
    this.ws.close();
    return null;
  }

  private onHeartbeatReceived() {
    this._lastHeartbeatReceived = new Date().valueOf();
  }

  private onMessage = ({ data: rawData }: { data: WebSocket.Data }) => {
    const data = JSON.parse(rawData as string);

    if (data && data.event === "heartbeat") {
      return this.onHeartbeatReceived();
    }

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
      return channelID;
    } catch (err) {
      //TODO: log? reject? what!?
      return -1;
    }
  }

  async unsubscribeByChannel(channelID: number) {
    const [_, confirmation] = await this.sendRPC<SubscriptionStatus>({ channelID }, "unsubscribe");
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
    const [channelID, confirmation] = await this.sendRPC<SubscriptionStatus>(
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

  subscribeToOrderBook(
    symbol: string,
    snapshotCallback: (data: OrderBookSnapshot) => void,
    deltaCallback: (data: OrderBookDeltaSet) => void,
  ): Promise<number> {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "book" },
    };

    return this.subscribe<KrakenOBSnapshotPayload | KrakenOBUpdatePayload>(payload, data => {
      if (isOBSnapshot(data)) {
        const snapshot: OrderBookSnapshot = {
          exchange: "kraken",
          instrument: { symbol },
          lastUpdated: new Date().valueOf(),
          asks: data.as.map(([price, volume, timestamp]) => ({
            level: Number(price),
            volume: Number(volume),
          })),
          bids: data.bs.map(([price, volume, timestamp]) => ({
            level: Number(price),
            volume: Number(volume),
          })),
        };
        snapshotCallback(snapshot);
      } else if (isOBUpdate(data)) {
        const delta: OrderBookDeltaSet = {
          exchange: "kraken",
          instrument: { symbol },
          lastUpdated: new Date().valueOf(),
          asks: (data.a || []).map(([price, volume, timestamp]) => ({
            level: Number(price),
            volume: Number(volume),
            timestamp: Number(timestamp),
          })),
          bids: (data.b || []).map(([price, volume, timestamp]) => ({
            level: Number(price),
            volume: Number(volume),
            timestamp: Number(timestamp),
          })),
        };
        deltaCallback(delta);
      }
    });
  }

  unsubscribeOrderBook(symbol: string) {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "book" },
    };
    return this.unsubscribeByPayload(payload);
  }

  subscribeToTrades(symbol: string, callback: (data: MarketTrade[]) => void): Promise<number> {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "trade" },
    };

    return this.subscribe<TradeUpdate[]>(payload, data => {
      const trades = data.map<MarketTrade>(tradeArr => ({
        exchange: "kraken",
        instrument: { symbol },
        price: Number(tradeArr[0]),
        volume: Number(tradeArr[1]),
        timestamp: timestampToMilliseconds(tradeArr[2]),
        // TODO: Add tradeArr[3..6]
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

type Ping = {
  event: "ping";
  reqid?: number;
};

type Pong = {
  event: "pong";
  reqid?: number;
};

type Heartbeat = {
  event: "heartbeat";
};

type SystemStatus = {
  event: "systemStatus";
  connectionID: number;
  status: "online" | "maintenance" | string;
  version: string;
};

type KrakenOBDepthValue = 10 | 25 | 100 | 500 | 1000;
type KrakenOHLCInterval = 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;

type SubscriptionStatus = {
  channelID: number;
  event: "subscriptionStatus";
  status: "subscribed" | "unsubscribed" | "error";
  pair: string;
  reqid?: number;
  subscription: {
    name: "ticker" | "ohlc" | "trade" | "book" | "spread" | "*";
    interval?: KrakenOHLCInterval;
    depth?: KrakenOBDepthValue;
  };
  errorMessage?: string;
};

type TradeUpdate = [string, string, string, string, string, string];

type LevelValue = [string, string, string]; // strings are floats

interface KrakenOBSnapshotPayload {
  as: LevelValue[];
  bs: LevelValue[];
}

interface KrakenOBUpdatePayload {
  a?: LevelValue[];
  b?: LevelValue[];
}

// type InboundMessage =
//   | Ping
//   | Pong
//   | KrakenOBUpdatePayload
//   | KrakenOBSnapshotPayload
//   | SystemStatus
//   | SubscriptionStatus
//   | Heartbeat;

function isOBSnapshot(
  data: KrakenOBSnapshotPayload | KrakenOBUpdatePayload,
): data is KrakenOBSnapshotPayload {
  return Object.keys(data).includes("as");
}

function isOBUpdate(
  data: KrakenOBSnapshotPayload | KrakenOBUpdatePayload,
): data is KrakenOBUpdatePayload {
  const keys = Object.keys(data);
  return keys.includes("a") || keys.includes("b");
}
