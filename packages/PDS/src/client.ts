import { Connection, Session } from "autobahn";
import { ITickerRequest, ITickerResponse } from "@core";

var url = "ws://localhost:32782/ws";    //Internal port: 8080
var realm = "cryptuff";
var topic = "com.cryptuff.pds";
var getTickerProcedure = "com.cryptuff.pds.getTicker";
var tickerRequest: ITickerRequest = { exchange: "Kraken", pair: "BTCEUR"};

console.log("Starting client...");

function onopen(session: Session) {
    session.subscribe(topic, (args) => {
        console.log(`Received topic ${topic}: ${JSON.stringify(args)}`);
    });

    setTimeout(async () => {
        console.log("Client requesting ticker");
        let ticker = await session.call<ITickerResponse>(getTickerProcedure, null, tickerRequest);
        console.log(`Ticker: ${JSON.stringify(ticker)}`);
    }, 3000);
}

(async () => {
    var connection = new Connection({ url, realm });
    connection.onopen = (session: Session, details: any) => {
        console.log("client connected to router!");
        onopen(session);
    };
    connection.open();
})();

