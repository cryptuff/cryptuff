import "./App.scss";

import { Button } from "@cryptuff/bitbobs";
import { KrakenWSClient, KrakenRestClient } from "@cryptuff/core";
import React, { Component, Suspense } from "react";
// import { BrowserRouter, Switch, Route, NavLink } from "react-router-dom";
import { Router, Link as NavLink, LinkProps, RouteComponentProps } from "@reach/router";
import styled from "styled-components";

import { PDSClient } from "./client";
import { KrakenTradesRig } from "./rigs/tradesRig";
import { OrderBookRig } from "./rigs/obRig";
import { KrakenAssetsRig } from "./rigs/assetsRig";
import { KrakenBalanceRig } from "./rigs/balanceRig";
import { KrakenTickersRig } from "./rigs/tickersRig";

const pdsClient = new PDSClient();
const kWSClient = new KrakenWSClient({ beta: false });
const kRestClient = new KrakenRestClient("https://api.kraken.com");
kRestClient.setKey(process.env.REACT_APP_KRAKEN_API_KEY);
kRestClient.setSecret(process.env.REACT_APP_KRAKEN_API_SECRET);
// NOTE: Run Chrome canary with --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp
// const kRestClient = new KrakenRestClient('https://cors-anywhere.herokuapp.com/https://api.kraken.com');

const views = ["/trades", "/ob", "/tickers", "/assets", "/balance"];

const withReach = <P extends object>(Component: React.ComponentType<P>) =>
  Component as (typeof Component) &
    React.ComponentType<React.ComponentProps<typeof Component> & RouteComponentProps>;

const KrakenTrades = withReach(KrakenTradesRig);
const KrakenAssets = withReach(KrakenAssetsRig);
const OrderBook = withReach(OrderBookRig);
const KrakenBalance = withReach(KrakenBalanceRig);
const KrakenTickers = withReach(KrakenTickersRig);

class App extends Component {
  render() {
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          {views.map((view, i) => (
            <Link key={view} to={view} className="nav">
              {view}
            </Link>
          ))}
          <Router>
            <KrakenTrades client={kWSClient} maxNumberOfTrades={30} path="/trades" />
            <OrderBook client={kWSClient} maxNumberOfEntries={10} path="/ob" />
            <KrakenTickers client={kRestClient} path="/tickers" />
            <KrakenAssets client={kRestClient} path="/assets" />
            <KrakenBalance client={kRestClient} path="/balance" />
          </Router>
          {/* <BrowserRouter>
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
              <Route path="/tickers" render={() => <KrakenTickersRig client={kRestClient} />} />
            </Switch>
          </BrowserRouter> */}
        </Suspense>
      </div>
    );
  }
}

const Link = styled<React.FC<LinkProps<any>>>(props => (
  //@ts-ignore
  <NavLink
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      return {
        className: props.className + " " + (isCurrent ? "active" : ""),
      };
    }}
  />
))`
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
