import "./App.scss";

import { Button } from "@cryptuff/bitbobs";
import { KrakenWSClient, KrakenRestClient } from "@cryptuff/core";
import React, { Component, Suspense } from "react";
import { BrowserRouter, Switch, Route, NavLink } from "react-router-dom";
import styled from "styled-components";

import { PDSClient } from "./client";
import { KrakenTradesRig } from "./rigs/tradesRig";
import { OrderBookRig } from "./rigs/obRig";
import { KrakenAssetsRig } from "./rigs/assetsRig";
import { KrakenBalanceRig } from "./rigs/balanceRig";

const pdsClient = new PDSClient();
const kWSClient = new KrakenWSClient({ beta: false });
const kRestClient = new KrakenRestClient("https://api.kraken.com");
kRestClient.setKey(process.env.REACT_APP_KRAKEN_API_KEY);
kRestClient.setSecret(process.env.REACT_APP_KRAKEN_API_SECRET);
// NOTE: Run Chrome canary with --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp
// const kRestClient = new KrakenRestClient('https://cors-anywhere.herokuapp.com/https://api.kraken.com');

const views = ["/trades", "/ob", "/assets", "/balance"];

interface State {}

class App extends Component<{}, State> {
  render() {
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          <BrowserRouter>
            <Button onClick={() => pdsClient.init()}>Init PDS client (open console)</Button>
            {views.map((view, i) => (
              <Link key={view} to={view} activeClassName="active" className="nav">
                {view}
              </Link>
            ))}
            <Switch>
              <Route
                path="/trades"
                render={() => <KrakenTradesRig client={kWSClient} maxNumberOfTrades={30} />}
              />
              <Route
                path="/ob"
                render={() => <OrderBookRig client={kWSClient} maxNumberOfEntries={10} />}
              />
              <Route path="/assets" render={() => <KrakenAssetsRig client={kRestClient} />} />
              <Route path="/balance" render={() => <KrakenBalanceRig client={kRestClient} />} />
            </Switch>
          </BrowserRouter>
        </Suspense>
      </div>
    );
  }
}

const Link = styled(NavLink)`
  display: inline-block;
  padding: 5px;
  width: 100px;

  &.active {
    font-weight: bold;
  }
`;

//@ts-ignore
window.pdsClient = pdsClient;
//@ts-ignore
window.kclient = kWSClient;
//@ts-ignore
window.kRestClient = kRestClient;

export default App;
