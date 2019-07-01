import "./App.css";

import { Button } from "@cryptuff/bitbobs";
import { KrakenWSClient, KrakenRestClient } from "@cryptuff/core";
import React, { Component, Suspense } from "react";

import { PDSClient } from "./client";
import { KrakenTradesRig } from "./rigs/tradesRig";
import { OrderBookRig } from "./rigs/obRig";
import styled from "styled-components";

const pdsClient = new PDSClient();
const kclient = new KrakenWSClient({ beta: false });
const kRestClient = new KrakenRestClient('https://cors-anywhere.herokuapp.com/https://api.kraken.com');

const views = ["Trades", "OB"];

interface State {
  view: number;
}

class App extends Component<{}, State> {
  state = {
    view: 0,
  };
  toggleView = () => {
    this.setState({ view: 1 - this.state.view });
  };
  render() {
    const { view } = this.state;
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          <Button onClick={() => pdsClient.init()}>
            Init PDS client (open console)
          </Button>
          <Button onClick={this.toggleView}>
            View [{views[view]}]. Click to show {views[1 - view]}
          </Button>

          <Widget visible={view === 0}>
            <KrakenTradesRig client={kclient} maxNumberOfTrades={30} />
          </Widget>
          <Widget visible={view === 1}>
            <OrderBookRig client={kclient} maxNumberOfEntries={10} />
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
