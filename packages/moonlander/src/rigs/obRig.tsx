import React from "react";
import styled from "styled-components";

import { KrakenWSClient, msToTimeString, OrderBookSnapshot, OrderBookDelta, OrderBookEntry } from "@cryptuff/core";

interface Props {
  maxNumberOfEntries: number;
  client: KrakenWSClient;
}
interface State {
  pair: string;
  orderBook?: OrderBookSnapshot;
  log: string[];
}

export class OrderBookRig extends React.Component<Props, State> {
  state: State = {
    pair: "BTC/USD",
    orderBook: undefined,
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
    this.log(`Subscribing to OB for: ${pair}`);
    const channelId = await this.props.client.subscribeToOrderBook(
      pair,
      orderBook => {
        this.setState({ orderBook });
      },
      orderBookDelta => {
        this.log(JSON.stringify(orderBookDelta));
      },
    );
    this.log(`Subscribed to trades for: ${pair} on channel ${channelId}`);
  };

  onUnSubscribeClick = () => {
    const { pair } = this.state;
    this.props.client.unsubscribeOrderBook(pair);
    this.log(`Unsubscribed trades for: ${pair}`);
  };

  render() {
    const { pair, orderBook, log } = this.state;
    return (
      <Rig>
        <ButtonSection>
          Pair:
          <input
            type="text"
            value={pair}
            onChange={ev => this.setState({ pair: ev.target.value })}
          />
          <button onClick={this.onSubscribeClick}>Subscribe OB</button>
          <button onClick={this.onUnSubscribeClick}>Unsubscribe</button>
        </ButtonSection>
        <div style={{ display: "flex" }}>
          <OrderBook orderBook={orderBook} />
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

const OrderBook: React.FC<{ orderBook?: OrderBookSnapshot }> = ({ orderBook }) => (
  <TableContainer>
    <pre>{JSON.stringify(orderBook || "")}</pre>
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

  pre {
    white-space: pre-wrap;
  }
`;

const Rig = styled.div`
  margin-top: 20px;
  padding: 10px;
`;
