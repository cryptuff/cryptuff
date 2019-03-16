const PROD_ENDPOINT = "wss://ws.kraken.com";
const SANDBOX_ENDPOINT = "wss://ws-sandbox.kraken.com";
const ENDPOINT =
  process.env.NODE_ENV === "production" ? PROD_ENDPOINT : SANDBOX_ENDPOINT;

interface Message {
  reqId?: number;
  pair: string[];
  subscription: {
    name: "ticker" | "ohlc" | "trade" | "book" | "spread" | "*";
    interval?: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600;
    depth?: 10 | 25 | 100 | 500 | 1000;
  };
}
export class KrakenClient {
  private endpoint = ENDPOINT;
  private ws?: WebSocket;

  private handlers: {
    [id: string]: (x: any) => any;
  };

  constructor() {
    this.endpoint = ENDPOINT;
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

  private onMessage = (event: MessageEvent) => {
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

    const reqid = 1234; // generate sequential reqid?

    this.reqIdsTempMap[reqid] = (msg: any) => {
      this.handlers[msg.channelID] = cb;

      delete this.reqIdsTempMap[reqid];
    };

    this.ws.send(
      JSON.stringify({
        ...payload,
        reqid,
        event: "subscribe"
      })
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
        event: "unsubscribe"
      })
    );
  };

  subscribeToOrderBook = (symbol: string, callback: (data: any) => void) => {
    const payload: Message = {
      pair: [symbol],
      subscription: { name: "book" }
    };

    this.subscribe(payload, callback);

    return () => {
      this.unsubscribe({
        pair: [symbol],
        subscription: {
          name: "book"
        }
      });
    };
  };
}

// const client = new KrakenClient({... });

// const teardown = client.subscribeToOrderBook({
//     symbol: 'btc/eur',
//     onSnapshot() {},
//     onUpdate() {},
// });

// teardown();
