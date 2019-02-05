import { Connection, Session, RegisterEndpoint } from "autobahn";
import { KrakenClient } from "./kraken-ws-client";
import { Methods, Exchange, Instrument } from "@cryptuff/core";

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
      this.routerSession = session!;
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
  }

  async registerServicesWithRouter() {
    let endpoint: RegisterEndpoint;
    let registration = await this.routerSession!.register(
      Methods.OrderBookSubscription,
      this.onOrderBookRequest,
      undefined
    );
    console.log(`Server registered ${registration.procedure}`, registration);
  }

  onOrderBookRequest(
    _: any,
    { exchange, instrument }: OrderBookRequestParameters
  ) {
    return `${exchange}: ${instrument};`;
  }
}
