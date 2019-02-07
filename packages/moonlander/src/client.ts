import { Connection, Session, SubscribeHandler, IEvent } from "autobahn";
import {
  ITickerRequest,
  ITickerResponse,
  OrderBookSubscription
} from "@cryptuff/core";

var url = "ws://localhost:38000/ws"; //Internal port: 8080
var realm = "com.cryptuff";
var topic = "com.cryptuff.pds";
var exchangeInstrument = { exchange: "Kraken", instrument: "ETHUSD" };

export function initClient() {
  console.log("Starting client...");

  function onopen(session: Session) {
    session.subscribe(
      "com",
      (args, kwargs, details) => {
        console.log(
          `Received topic ${details!.topic} with args/kwargs/details:\n`,
          args,
          kwargs,
          details
        );
      },
      { match: "prefix" }
    );

    setInterval(async () => {
      console.log("Client requesting OB (RPC request)");
      let ticker = await session.call<string>(
        OrderBookSubscription,
        null,
        exchangeInstrument
      );
      console.log(`Received: ${JSON.stringify(ticker)}`);
    }, 3000);
  }

  (async () => {
    var connection = new Connection({ url, realm });
    connection.onopen = (session: Session, details: any) => {
      console.log("client connected to router!", details);
      onopen(session);
    };
    connection.open();
  })();
}
