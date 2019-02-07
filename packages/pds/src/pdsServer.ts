import { Connection, Session, RegisterEndpoint } from "autobahn";
import { KrakenClient } from "./kraken-ws-client";
import { Exchange, Instrument, OrderBookSubscription } from "@cryptuff/core";

const CRYPTUFF_REALM = "com.cryptuff";

interface OrderBookRequestParameters {
  exchange: Exchange;
  instrument: Instrument;
}

export class PDSServer {
  private routerConnection: Connection;
  private routerSession?: Session;
  private krakenClient: KrakenClient;

  constructor(
    private serverUrl: string,
    private realm: string = CRYPTUFF_REALM
  ) {
    console.log("Initialising pds server...");

    this.routerConnection = new Connection({
      url: this.serverUrl,
      realm: this.realm
    });
    this.krakenClient = new KrakenClient();
  }

  connectToRouter() {
    this.routerConnection.onopen = (session: Session, details: any) => {
      console.log(
        `pds server connected to router via autobahn!`,
        session,
        details
      );
      this.routerSession = session;
      this.onSessionOpen();
    };
    this.routerConnection.onclose = (reason, details) => {
      console.error(
        `Autobahn connection to router closed!!\nReason: ${reason}\nDetails:`,
        details
      );
      return false;
    };
    this.routerConnection.open();
  }

  private onSessionOpen() {
    this.registerServicesWithRouter();
    this.initPrompt();
  }
  initPrompt() {
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
            topic: args
          },
          { disclose_me: true }
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
      this.onOrderBookRequest
    );
    console.log(`Server registered ${registration.procedure}`, registration);
  }

  async onOrderBookRequest(
    _: any,
    { exchange, instrument }: OrderBookRequestParameters
  ) {
    return `${exchange}: ${instrument};`;
  }
}
