import dotenv from "dotenv";
import path from "path";
import { Connection, Session } from "autobahn";
import { PDSServer } from "./pdsServer";
import { KrakenRestClient } from "@cryptuff/core";

dotenv.config();

if (!process.env.ROUTER_ENDPOINT) throw new Error("No Router Endpoint");
if (!process.env.KRAKEN_WS_ENDPOINT) throw new Error("No Kraken Endpoint");

var routerUrl = process.env.ROUTER_ENDPOINT;
var realm = "com.cryptuff";
var topic = "com.cryptuff.pds";
var getTickerProcedure = "com.cryptuff.pds.getTicker";

async function run() {
  // var pdsServer = new PDSServer(routerUrl);
  // await pdsServer.connectToExchanges();
  // await pdsServer.connectToRouter();
  // var kraken = new KrakenRestClient();
  // kraken.setKey(process.env.REACT_APP_KRAKEN_API_KEY!);
  // kraken.setSecret(process.env.REACT_APP_KRAKEN_API_SECRET!);
  // const balance = await kraken.getBalance();
  // console.log(balance);
}

// console.log("PDS is noop");
run();
