import {
  Connection,
  Session,
  SubscribeHandler,
  IEvent,
  Subscription,
  ISubscription,
} from "autobahn";
import {
  ITickerRequest,
  ITickerResponse,
  OrderBookSubscription,
  Exchange,
  Instrument,
  CRYPTUFF_REALM,
} from "@cryptuff/core";

var topic = "com.cryptuff.pds";
var exchangeInstrument = { exchange: "Kraken", instrument: "ETHUSD" };

export class Client {
  private _session?: Session;

  private get session() {
    if (!this._session) {
      throw new Error("session not initialized");
    }
    return this._session;
  }

  constructor(public config: { url: string; realm: string }) {
    console.log("Starting client...");
  }

  private onSessionOpen(session: Session, details: any) {
    console.log("client connected to router!", details);
    this._session = session;
  }

  async connect() {
    const { url, realm } = this.config;
    const connection = new Connection(this.config);

    return new Promise((resolve, reject) => {
      connection.onopen = (...args) => {
        this.onSessionOpen(...args);
        resolve();
      };

      connection.onclose = (reason, details) => {
        console.log("Session was closed or could not be established:", reason, details);
        reject(reason);
        if (reason === "lost") {
          return false;
        } else {
          reject(reason);
          return true;
        }
      };

      connection.open();
    });
  }
  subscribe<T>(topic: string, onResults: (r: T[]) => void) {
    return this.session.subscribe(topic, onResults);
  }

  unsubscribe(subscription: Subscription) {
    return this.session.unsubscribe(subscription);
  }

  call<T, TPayload>(methodName: string, payload: TPayload) {
    return this.session.call<T>(methodName, null, payload);
  }
}

var url = "ws://localhost:38000/ws"; //Internal port: 8080

export class PDSClient {
  client: Client;

  constructor() {
    this.client = new Client({ url, realm: CRYPTUFF_REALM });
  }

  init() {
    return this.client.connect();
  }

  getOrderBookSnapshot(exchange: Exchange, pair: Instrument) {
    return this.client.call(OrderBookSubscription, {
      exchange,
      instrument: pair,
    });
  }
}
