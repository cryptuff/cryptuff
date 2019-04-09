import dotenv from "dotenv";
import path from "path";
import { Connection, Session } from "autobahn";
import { PDSServer } from "./pdsServer";

dotenv.config();

if (!process.env.ROUTER_ENDPOINT) throw new Error("No Router Endpoint");
if (!process.env.KRAKEN_ENDPOINT) throw new Error("No Kraken Endpoint");

var routerUrl = process.env.ROUTER_ENDPOINT;
var realm = "com.cryptuff";
var topic = "com.cryptuff.pds";
var getTickerProcedure = "com.cryptuff.pds.getTicker";

(async () => {
  var pdsServer = new PDSServer(routerUrl);
  await pdsServer.connectToRouter();
})();
