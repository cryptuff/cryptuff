import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { msToTimeString, KrakenRestClient, Unpacked, WellKnownFiatAssets } from "@cryptuff/core";
import { ApiKeySecretForm } from "./ApiKeySecretForm";

interface Props {
  client: KrakenRestClient;
}

type BalanceSheet = { [coin: string]: number };
type Assets = KResponse<"getAssets">;
type Balance = KResponse<"getBalance">;

type KResponse<T extends keyof typeof KrakenRestClient.prototype> = Unpacked<
  (typeof KrakenRestClient.prototype)[T]
>;

export function KrakenBalanceRig({ client }: Props) {
  const [balances, setBalances] = useState<BalanceSheet>({});
  const [assets, setAssets] = useState<Assets>({});
  const [apiData, setApiData] = useState<[string, string]>([client.key!, client.secret!]);

  async function retrieveAssets() {
    const assets = await client.getAssets();
    setAssets(assets);
  }

  async function retrieveBalances() {
    let balance: Balance;
    try {
      balance = await client.getBalance();
      setBalances((balance as unknown) as BalanceSheet);
    } catch (e) {
      console.error(e, (e as Error).stack);
    }
  }

  function setClientApiKeys(key: string, secret: string) {
    client.setKey(key);
    client.setSecret(secret);
    setApiData([key, secret]);
  }

  return (
    <Rig>
      <ButtonSection>
        <button onClick={retrieveAssets}>Assets</button>
        <button onClick={retrieveBalances}>Balance</button>
      </ButtonSection>
      <div style={{ display: "flex" }}>
        <AssetsTable assets={assets} />
        <TableContainer>
          <ApiKeySecretForm onSubmit={(key, secret) => setClientApiKeys(key, secret)} />
          {apiData && (
            <div>
              ApiData:
              <br />
              {apiData[0]}
              <br />
              <ApiPw>
                {apiData[1]}
              </ApiPw>
            </div>
          )}
          <BalancesTable balances={balances} />
        </TableContainer>
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

const BalancesTable: React.FC<{ balances: BalanceSheet }> = ({ balances }) => (
  <>
    <h2>Kraken balance</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Holdings</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(balances).map(([symbol, amount]) => (
          <tr key={symbol}>
            <td>{symbol}</td>
            <td>{amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
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
