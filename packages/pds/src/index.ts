import dotenv from "dotenv";
import path from "path";
import { Connection, Session } from "autobahn";
import { ITickerRequest, ITickerResponse, Core } from "@cryptuff/core";
import { PDSServer } from "./pdsServer";

dotenv.config();

if (!process.env.ROUTER_ENDPOINT) throw new Error("No Router Endpoint");
if (!process.env.KRAKEN_ENDPOINT) throw new Error("No Router Endpoint");

var routerUrl = process.env.ROUTER_ENDPOINT;
var realm = "com.cryptuff";
var topic = "com.cryptuff.pds";
var getTickerProcedure = "com.cryptuff.pds.getTicker";

(async () => {
  var pdsServer = new PDSServer(routerUrl);
  await pdsServer.connectToRouter();
  // var connection = new Connection({ url: routerUrl, realm });
  // connection.onopen = (session: Session, details: any) => {
  //   console.log("pds server connected to router!");
  //   onopen(session);
  // };
  // connection.open();
})();
