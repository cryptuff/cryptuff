import React from "react";
import styled from "styled-components";

import { MarketTrade, KrakenWSClient, msToTimeString } from "@cryptuff/core";

interface Props {
  maxNumberOfTrades: number;
  client: KrakenWSClient;
}
interface State {
  pair: string;
  trades: MarketTrade[];
  log: string[];
}

export class KrakenTradesRig extends React.Component<Props, State> {
  state: State = {
    pair: "BTC/EUR",
    trades: [],
    log: [],
  };

  log(msg: string) {
    const date = new Date();
    const dateStr = date.toTimeString().slice(0, 8);
    this.setState(s => ({ log: [`[${dateStr}.${date.valueOf() % 1000}] ${msg}`, ...s.log] }));
  }
  componentDidMount() {
    this.props.client.connect();
  }

  onSubscribeClick = async () => {
    const { pair } = this.state;

    this.log(`Subscribing to trades for: ${pair}`);
    const channelID = await this.props.client.subscribeToTrades(pair, newTrades => {
      const existingTrades = this.state.trades.slice(
        0,
        this.props.maxNumberOfTrades - newTrades.length,
      );
      this.setState({ trades: [...newTrades, ...existingTrades] });
    });
    this.log(`Subscribed to trades for: ${pair} on channel ${channelID}`);
  };

  onUnSubscribeClick = () => {
    const { pair } = this.state;
    this.props.client.unsubscribeTrades(pair);
    this.log(`Unsubscribed trades for: ${pair}`);
  };

  render() {
    const { pair, trades, log } = this.state;
    return (
      <Rig>
        <ButtonSection>
          Pair:
          <input
            type="text"
            value={pair}
            onChange={ev => this.setState({ pair: ev.target.value })}
          />
          <button onClick={this.onSubscribeClick}>Subscribe trades</button>
          <button onClick={this.onUnSubscribeClick}>Unsubscribe</button>
        </ButtonSection>
        <div style={{ display: "flex" }}>
          <TradesTable trades={trades} />
          <Log>
            <ul>
              {log.map(entry => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </Log>
        </div>
      </Rig>
    );
  }
}

const TradesTable: React.FC<{ trades: MarketTrade[] }> = ({ trades }) => (
  <TableContainer>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Time</th>
          <th>Price</th>
          <th>Volume</th>
        </tr>
      </thead>
      <tbody>
        {trades.map(t => (
          <tr key={`${t.exchange}_${t.instrument.symbol}_${t.timestamp}_${t.volume}`}>
            <td>{t.instrument.symbol}</td>
            <td>{msToTimeString(t.timestamp)}</td>
            <td>{t.price}</td>
            <td>{t.volume}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableContainer>
);

const Log = styled("div")`
  flex: 1;
  border: 1px green solid;
  padding: 10px;
`;

const ButtonSection = styled.div``;

const TableContainer = styled.div`
  flex: 2;
  border: 1px orange solid;
  padding: 10px;

  table {
    width: 100%;
    th {
      border-bottom: 1px solid gray;
    }
  }
`;

const Rig = styled.div`
  margin-top: 20px;
  padding: 10px;
`;
