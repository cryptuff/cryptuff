import { Connection, Session } from "autobahn";
import { ITickerRequest, ITickerResponse, Core } from "@core";

var url = "ws://localhost:32782/ws";    //Internal port: 8080
var realm = "cryptuff";
var topic = "com.cryptuff.pds";
var getTickerProcedure = "com.cryptuff.pds.getTicker";

console.log("Starting PDS server...");

var a = 0;

const onopen = (async (session: Session) => {
    setInterval(async () => {
        a++
        console.log(`Server publishing on ${topic}: ${a}`);
        await session.publish(topic, [{ obj: a }]);
    }, 2000);
    console.log("Server registering getTicker");
    try {
        let registration = await session.register("com.cryptuff.pds.getTicker", (args, { exchange, pair }: ITickerRequest) => {
            console.log(`Serving ticker ${pair}@${exchange}`);
            return { price: 3.14 } as ITickerResponse;
        }, { invoke: "roundrobin"});
        console.log(`Server registered ${registration.procedure}`);
    }
    catch (e) {
        debugger;
    }
});

(async () => {
    var connection = new Connection({ url, realm });
    connection.onopen = (session: Session, details: any) => {
        console.log("PDS server connected to router!");
        onopen(session);
    };
    connection.open();
})();
