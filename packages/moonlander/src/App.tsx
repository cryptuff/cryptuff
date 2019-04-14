import "./App.css";

import { Button } from "@cryptuff/bitbobs";
import { Core } from "@cryptuff/core";
import { KrakenClient } from "@cryptuff/core";
import React, { Component, Suspense } from "react";

import { PDSClient } from "./client";
import { KrakenClientRig } from "./rigs/clientRig";

const client = new PDSClient();
const kclient = new KrakenClient({ sandbox: true });

class App extends Component {
  render() {
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          <Button label={Core} onClick={() => client.init()}>
            Init PDS client (open console)
          </Button>
          <Button
            onClick={async () => {
              const ob = await client.getOrderBookSnapshot("kraken", {
                token: "xbt",
                quote: "eur",
                symbol: "XBT/EUR",
              });
              console.log(ob);
            }}
          >
            Get orderbook
          </Button>
          <KrakenClientRig maxNumberOfTrades={30} />
        </Suspense>
      </div>
    );
  }
}

//@ts-ignore
window.client = client;
//@ts-ignore
window.kclient = kclient;
kclient.connect();

export default App;
