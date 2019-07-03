import { Connection, Session, RegisterEndpoint } from "autobahn";
import {
  Exchange,
  Instrument,
  OrderBookSubscription,
  KrakenWSClient,
  CRYPTUFF_REALM,
  OrderBookSnapshot,
  OrderBookDelta,
} from "@cryptuff/core";

interface OrderBookRequestParameters {
  exchange: Exchange;
  instrument: Instrument;
}

interface Register {
  orderbook: {
    [key: string]: {
      interests: number;
      snapshot: OrderBookSnapshot;
    };
  };
}

export class PDSServer {
  private routerConnection: Connection;
  private routerSession?: Session;
  private krakenClient: KrakenWSClient;

  private register: Register;

  constructor(private routerUrl: string, realm: string = CRYPTUFF_REALM) {
    console.log("Initialising pds server...");

    this.routerConnection = new Connection({
      url: this.routerUrl,
      realm: realm,
    });
    this.krakenClient = new KrakenWSClient({ beta: true });
    this.register = { orderbook: {} };
  }

  async connectToExchanges() {
    console.log("Connecting to Kraken...");
    await this.krakenClient.connect();
    console.log("Kraken connected!");
  }

  connectToRouter() {
    this.routerConnection.onopen = (session: Session, details: any) => {
      this.routerSession = session;
      this.onSessionOpen();
    };
    this.routerConnection.onclose = (reason, details) => {
      console.error(`Autobahn connection to router closed!!\nReason: ${reason}\nDetails:`, details);
      return false;
    };
    this.routerConnection.open();
  }

  private onSessionOpen() {
    this.registerServicesWithRouter();
    this.initPrompt();
  }
  initPrompt() {
    console.log("Awaiting input");
    process.openStdin().addListener("data", async data => {
      if (!this.routerSession) return;
      const input = (data || "").toString().trimEnd();
      const [_, command, args]: string[] = /^([^\s]+)\s(.*)$/.exec(input) || [];
      if (!command || !args) return;
      if (command === "publish") {
        const p = await this.routerSession.publish(
          args,
          [args],
          {
            topic: args,
          },
          { disclose_me: true },
        );
        console.log(`Published: ${args}`);
      }
    });
  }

  async registerServicesWithRouter() {
    if (!this.routerSession) throw Error("Router session not established");

    let endpoint: RegisterEndpoint;

    let registration = await this.routerSession.register(
      OrderBookSubscription,
      this.onOrderBookRequest.bind(this),
    );
  }

  async subscribeToOrderBook(exchange: Exchange, symbol: string) {
    if (exchange === "kraken") {
      this.krakenClient.subscribeToOrderBook(symbol, data => {}, data => {});
    }

    throw new Error(`Exchange ${exchange} not supported`);
  }

  async onOrderBookRequest(_: any, { exchange, instrument }: OrderBookRequestParameters) {
    const { symbol } = instrument;
    const key = `${exchange}__${symbol}`;
    console.log(`Received order book request for ${key}`);
    var ob = this.register.orderbook[key];
    // WIP!!
    if (ob && ob.interests > 0) {
      return ob.snapshot;
    } else {
      // Register interest
      await this.subscribeToOrderBook(exchange, symbol!);

      // Return a promise or something?
    }
    return;
  }
}
