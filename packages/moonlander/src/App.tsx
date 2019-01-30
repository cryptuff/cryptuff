import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import { ITickerRequest, ITickerResponse, Core } from "@cryptuff/core";
// import Button from "./Button";         // This works
import Button from "@cryptuff/bitbobs";   // This doesn't cuz 2 x react

class App extends Component {
  render() {
    return (
      <div className="App">
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
            <Button label={Core} onClick={() => { alert("click!")}} />
        </header>
      </div>
    );
  }
}

export default App;
