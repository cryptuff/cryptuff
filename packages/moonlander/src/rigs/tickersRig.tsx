import React, { useState } from "react";
import styled from "styled-components";

import { KrakenRestClient, GetTickerResponse } from "@cryptuff/core";

interface Props {
  client: KrakenRestClient;
}

type Tickers = GetTickerResponse

export function KrakenTickersRig({ client }: Props) {
  const [tickers, setTickers] = useState<Tickers>({});

  async function retrieveTickers() {
    const pairs = Object.keys(await client.getAssetPairs()).filter(pair => !/\.d$/.test(pair));

    const tickers = await client.getTicker({ pairs });
    setTickers(tickers);
  }

  return (
    <Rig>
      <ButtonSection>
        <button onClick={retrieveTickers}>Get Tickers</button>
      </ButtonSection>
      <div style={{ display: "flex" }}>
        <Tickers tickers={tickers} />
      </div>
    </Rig>
  );
}

const Tickers: React.FC<{ tickers: Tickers }> = ({ tickers }) => (
  <TableContainer>
    <h2>Tickers</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Ask</th>
          <th>Last</th>
          <th>Bid</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(tickers).map(([symbol, { a: [aPrice, aVol], c: [cPrice, cVol], b: [bPrice, bVol] }]) => (
          <tr key={symbol}>
            <td>{symbol}</td>
            <td>{aPrice} [{aVol}]</td>
            <td>{bPrice} [{bVol}]</td>
            <td>{cPrice} [{cVol}]</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableContainer>
);

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
