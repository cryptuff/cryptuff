import { Connection, Session } from "autobahn";
import { ITickerRequest, ITickerResponse, Core } from "@cryptuff/core";
import { PDSServer } from "./pdsServer";

import dotenv from "dotenv";
dotenv.config();

var routerUrl = "ws://localhost:38000/ws"; //Internal port: 8000
var realm = "com.cryptuff";
var topic = "com.cryptuff.pds";
var getTickerProcedure = "com.cryptuff.pds.getTicker";

// const onopen = async (session: Session) => {
//   var a = 0;
//   setInterval(async () => {
//     a++;
//     console.log(`Server publishing on ${topic}: ${a}`);
//     await session.publish(topic, [{ obj: a }]);
//   }, 2000);
//   console.log("Server registering getTicker");
//   try {
//     let registration = await session.register(
//       "com.cryptuff.pds.getTicker",
//       (args, { exchange, pair }: ITickerRequest) => {
//         console.log(`Serving ticker ${pair}@${exchange}`);
//         return { price: 3.14 } as ITickerResponse;
//       },
//       { invoke: "roundrobin" }
//     );
//     console.log(`Server registered ${registration.procedure}`);
//   } catch (e) {
//     debugger;
//   }
// };

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
