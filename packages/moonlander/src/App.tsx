import "./App.css";

import { Button } from "@cryptuff/bitbobs";
import { KrakenWSClient, KrakenRestClient } from "@cryptuff/core";
import React, { Component, Suspense } from "react";

import { PDSClient } from "./client";
import { KrakenTradesRig } from "./rigs/tradesRig";
import { OrderBookRig } from "./rigs/obRig";
import { KrakenBalanceRig } from "./rigs/assetsRig";
import styled from "styled-components";

const pdsClient = new PDSClient();
const kclient = new KrakenWSClient({ beta: false });
const kRestClient = new KrakenRestClient('https://api.kraken.com');
kRestClient.setKey(process.env.REACT_APP_API_KEY as string);
kRestClient.setSecret(process.env.REACT_APP_API_SECRET as string);
// NOTE: Run Chrome canary with --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp
// const kRestClient = new KrakenRestClient('https://cors-anywhere.herokuapp.com/https://api.kraken.com');

const views = ["Trades", "OB", "Assets/Balance"];

interface State {
  view: number;
}

class App extends Component<{}, State> {
  state = {
    view: 2,
  };
  setView = (view: number) => {
    this.setState({ view });
  };
  render() {
    const { view } = this.state;
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          <Button onClick={() => pdsClient.init()}>
            Init PDS client (open console)
          </Button>
          {" "}
          Current View [{views[view]}]
          <br/> 
          {views.map((view, i) => (
          <Button onClick={this.setView.bind(this, i)}>
            Click to show {views[i]}
          </Button>
          ))}

          <Widget visible={view === 0}>
            <KrakenTradesRig client={kclient} maxNumberOfTrades={30} />
          </Widget>
          <Widget visible={view === 1}>
            <OrderBookRig client={kclient} maxNumberOfEntries={10} />
          </Widget>
          <Widget visible={view === 2}>
            <KrakenBalanceRig client={kRestClient} />
          </Widget>
        </Suspense>
      </div>
    );
  }
}

const Widget = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => (visible ? "block" : "none")};
`;

//@ts-ignore
window.pdsClient = pdsClient;
//@ts-ignore
window.kclient = kclient;
//@ts-ignore
window.kRestClient = kRestClient;

export default App;
