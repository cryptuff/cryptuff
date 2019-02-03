import React, { Component, Suspense } from "react";
import logo from "./logo.svg";
import "./App.css";

import { ITickerRequest, ITickerResponse, Core } from "@cryptuff/core";
import { Button } from "@cryptuff/bitbobs"; 
import { initClient } from "./client";


class App extends Component {
  render() {
    return (
      <div className="App">
        <Suspense fallback={<h2>Loading</h2>}>
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              {React.version}
            </a>
            <br />
            <ul>
              {Object.keys(process.env).map(x => (
                <li key={x}>{`${x}: ${process.env[x]}`}</li>
              ))}
            </ul>
            <Button
              label={Core}
              onClick={initClient}
            >Init PDS client (open console)</Button>
          </header>
        </Suspense>
      </div>
    );
  }
}

export default App;
