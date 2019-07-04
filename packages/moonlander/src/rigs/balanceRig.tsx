import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { KrakenRestClient, WellKnownFiatAssets, Unpacked } from "@cryptuff/core";
import { ApiKeySecretForm } from "./ApiKeySecretForm";

interface Props {
  client: KrakenRestClient;
}

type BalanceSheet = { [coin: string]: number };
type Balance = KResponse<"getBalance">;

type KResponse<T extends keyof typeof KrakenRestClient.prototype> = Unpacked<
  (typeof KrakenRestClient.prototype)[T]
>;

export function KrakenBalanceRig({ client }: Props) {
  const [balances, setBalances] = useState<BalanceSheet>({});
  const [balanceAsset, setBalanceAsset] = useState<string>("ZEUR");
  const [apiData, setApiData] = useState<[string, string]>([client.key!, client.secret!]);

  async function retrieveBalances() {
    let balance: Balance;
    try {
      balance = await client.getBalance();
      setBalances((balance as unknown) as BalanceSheet);
    } catch (e) {
      console.error(e, (e as Error).stack);
    }
  }

  async function retrieveTradeBalance() {
    let balance: Balance;
    try {
      balance = await client.getTradeBalance(balanceAsset ? { asset: balanceAsset } : undefined);
      console.log(balance);
    } catch (e) {
      console.error(e, (e as Error).stack);
    }
  }

  async function retrieveBalanceCcxt() {
    // const balance = await ccxtkraken.fetchBalance();
  }

  function setClientApiKeys(key: string, secret: string) {
    client.setKey(key);
    client.setSecret(secret);
    setApiData([key, secret]);

    // const ccxtkraken = new ccxt.kraken({
    //   apiKey: process.env.REACT_APP_KRAKEN_API_KEY,
    //   secret: process.env.REACT_APP_KRAKEN_API_SECRET,
    // });
  }

  useEffect(() => {
    // retrieveBalances();
  }, []);

  return (
    <Rig>
      <ButtonSection>
        <input type="text" value={balanceAsset} onChange={ev => setBalanceAsset(ev.target.value)} />
        <button onClick={retrieveTradeBalance}>Trade Balance</button>
        <br />
        <button onClick={retrieveBalances}>Balance</button>
        <br />
        {/* <button onClick={retrieveBalanceCcxt}>CCXT Balance</button> */}
      </ButtonSection>
      <div style={{ display: "flex" }}>
        <TableContainer>
          <ApiKeySecretForm onSubmit={(key, secret) => setClientApiKeys(key, secret)} />
        </TableContainer>
        <TableContainer>
          {apiData && (
            <div>
              ApiData:
              <br />
              {apiData[0]}
              <br />
              <ApiPw>{apiData[1]}</ApiPw>
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

const BalancesTable: React.FC<{ balances: BalanceSheet }> = ({ balances }) => (
  <>
    <h2>Kraken balance</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(balances).map(([symbol, amount]) => (
          <tr key={symbol} style={isFiat(symbol) || isFiat(symbol) ? { color: "goldenrod" } : {}}>
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
