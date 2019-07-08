import React, { useState } from "react";
import styled from "styled-components";

import { KrakenRestClient, WellKnownFiatAssets, Unpacked } from "@cryptuff/core";

interface Props {
  client: KrakenRestClient;
}

type Assets = KResponse<"getAssets">;
type AssetPairs = KResponse<"getAssetPairs">;

type KResponse<T extends keyof typeof KrakenRestClient.prototype> = Unpacked<
  (typeof KrakenRestClient.prototype)[T]
>;

export function KrakenAssetsRig({ client }: Props) {
  const [pairs, setPairs] = useState<AssetPairs>({});
  const [assets, setAssets] = useState<Assets>({});

  async function retrieveAssets() {
    const assets = await client.getAssets();
    setAssets(assets);
  }

  async function retrieveAssetPairs() {
    const pairs = await client.getAssetPairs();
    setPairs(pairs);
  }

  return (
    <Rig>
      <ButtonSection>
        <button onClick={retrieveAssets}>Assets</button>
        <button onClick={retrieveAssetPairs}>Pairs</button>
      </ButtonSection>
      <div style={{ display: "flex" }}>
        <AssetsTable assets={assets} />
        <AssetPairsTable pairs={pairs} />
      </div>
    </Rig>
  );
}

const ApiPw = styled.span`
  opacity: 0;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.4;
  }
`;

function isFiat(asset: string) {
  const fiatAssets = (WellKnownFiatAssets as unknown) as string[];
  return fiatAssets.includes(asset);
}

const AssetsTable: React.FC<{ assets: Assets }> = ({ assets }) => (
  <TableContainer>
    <h2>Kraken assets</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Altname</th>
          <th>Decimals</th>
          <th>Display decimals</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(assets).map(([symbol, { altname, decimals, display_decimals }]) => (
          <tr key={symbol} style={isFiat(symbol) || isFiat(altname) ? { color: "goldenrod" } : {}}>
            <td>{symbol}</td>
            <td>{altname}</td>
            <td>{decimals}</td>
            <td>{display_decimals}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableContainer>
);

const AssetPairsTable: React.FC<{ pairs: AssetPairs }> = ({ pairs }) => (
  <TableContainer>
    <h2>Kraken asset pairs</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Altname</th>
          <th>WS name</th>
          <th>Pair decimals</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(pairs).map(([symbol, { altname, wsname, pair_decimals }]) => (
          <tr key={symbol} style={isFiat(symbol) || isFiat(altname) ? { color: "goldenrod" } : {}}>
            <td>{symbol}</td>
            <td>{altname}</td>
            <td>{wsname}</td>
            <td>{pair_decimals}</td>
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
