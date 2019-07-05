import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { KrakenRestClient, WellKnownFiatAssets, Unpacked } from "@cryptuff/core";
import { ApiKeySecretForm } from "./ApiKeySecretForm";

interface Props {
  client: KrakenRestClient;
}

type Balance = KResponse<"getBalance">;
type TradeBalance = KResponse<"getTradeBalance">;

type KResponse<T extends keyof typeof KrakenRestClient.prototype> = Unpacked<
  (typeof KrakenRestClient.prototype)[T]
>;

export function KrakenBalanceRig({ client }: Props) {
  const [balanceAsset, setBalanceAsset] = useState<string>("ZEUR");
  const [apiData, setApiData] = useState<[string, string]>([client.key!, client.secret!]);

  const [balance, setBalance] = useState<Balance>();
  const [tradeBalance, setTradeBalance] = useState<TradeBalance>();

  async function retrieveBalances() {
    let balance: Balance;
    try {
      balance = await client.getBalance();
      setBalance(balance);
    } catch (e) {
      console.error(e, (e as Error).stack);
    }
  }

  async function retrieveTradeBalance() {
    let tradeBalance: TradeBalance;
    try {
      tradeBalance = await client.getTradeBalance(balanceAsset ? { asset: balanceAsset } : undefined);
      setTradeBalance(tradeBalance);
    } catch (e) {
      console.error(e, (e as Error).stack);
    }
  }

  function setClientApiKeys(key: string, secret: string) {
    client.setKey(key);
    client.setSecret(secret);
    setApiData([key, secret]);
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
          <TradeBalancesTable tradeBalance={tradeBalance} />
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
          <BalancesTable balance={balance} />
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

const TradeBalancesTable: React.FC<{ tradeBalance?: TradeBalance }> = ({ tradeBalance = {} }) => (
  <>
    <h2>Kraken Trade balance</h2>
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(tradeBalance).map(([key, amount]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

const BalancesTable: React.FC<{ balance?: Balance }> = ({ balance = {} }) => (
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
        {Object.entries(balance).map(([symbol, amount]) => (
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
