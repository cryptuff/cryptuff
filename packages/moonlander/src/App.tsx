import "./App.css";

import { Button } from "@cryptuff/bitbobs";
import { Core } from "@cryptuff/core";
import { KrakenClient } from "@cryptuff/core";
import React, { Component, Suspense } from "react";

import { PDSClient } from "./client";
import { KrakenClientRig } from "./rigs/clientRig";

const pdsClient = new PDSClient();
const kclient = new KrakenClient({ sandbox: true });

class App extends Component {
  render() {
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          <Button label={Core} onClick={() => pdsClient.init()}>
            Init PDS client (open console)
          </Button>
          <Button
            onClick={async () => {
              const ob = await pdsClient.getOrderBookSnapshot("kraken", {
                token: "xbt",
                quote: "eur",
                symbol: "XBT/EUR",
              });
              console.log(ob);
            }}
          >
            Get orderbook
          </Button>
          <KrakenClientRig client={kclient} maxNumberOfTrades={30} />
        </Suspense>
      </div>
    );
  }
}

//@ts-ignore
window.client = pdsClient;
//@ts-ignore
window.kclient = kclient;
// kclient.connect();

export default App;
