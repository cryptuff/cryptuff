/**
 * Loosely based on https://github.com/TimoHanisch/KrakenTypeScriptClient
 */

import axios, { AxiosRequestConfig } from "axios";
import { LiteralUnion, querystringify } from "../../util";
import * as encoding from "../../util/encoding";
import * as crypto from "../../util/crypto";

export class KrakenRestClient {
  private config: Config;

  /**
   * Initializes the object with default settings.
   * url: https://api.kraken.com - API url
   * version: 0 - API version
   * timeout: 5000 - Milliseconds before the request is interrupted
   **/
  public constructor(url: string = "https://api.kraken.com") {
    this.config = {
      url,
      version: "0",
      timeout: 5000,
    };
  }

  /**
   * Sets the timeout for the API request duration.
   *
   * @param {number} milliseconds The time before a request is interrupted
   * @returns {KrakenRestClient} The client
   **/
  public setTimeout(milliseconds: number): KrakenRestClient {
    this.config.timeout = milliseconds;
    return this;
  }

  /**
   * Returns the time in milliseconds before a request is interrupted
   *
   * @returns {number} Number of milliseconds after which a request is interrupted.
   **/
  public get timeout(): number {
    return this.config.timeout;
  }

  /**
   * Sets the API-Key which can be generated here: https://www.kraken.com/u/settings/api
   *
   * @param {string} key The key generated by Kraken.
   * @returns {KrakenRestClient} The client
   **/
  public setKey(key: string): KrakenRestClient {
    this.config.key = key;
    return this;
  }

  /**
   * Returns the key saved in the internal config object.
   *
   * @returns {string} The key set for the client or undefined.
   **/
  public get key(): string | undefined {
    return this.config.key;
  }

  /**
   * Sets the secret which is generated alongside your API-Key to sign messages sent
   * to the Kraken-API.
   *
   * @param {string} secret The secret generated by Kraken.
   * @returns {KrakenRestClient} The client
   **/
  public setSecret(secret: string): KrakenRestClient {
    this.config.secret = secret;
    return this;
  }

  /**
   * Returns the secret saved in the internal config object.
   *
   * @returns {string} The secret set for the client or undefined.
   **/
  public get secret(): string | undefined {
    return this.config.secret;
  }

  /**
   * Returns the current Kraken server time as stated in https://www.kraken.com/help/api#get-server-time
   **/
  public getTime() {
    return this.publicMethod("Time") as Promise<GetTimeResponse>;
  }

  /**
   * Returns the current Kraken asset infos as stated in https://www.kraken.com/help/api#get-asset-info
   *
   * @param {any} params An object containing the input data as stated in the API description
   **/
  public getAssets(params: GetAssetsRequest = {}) {
    const assetParams =
      params.assets && params.assets.length > 0 ? { asset: params.assets.join(",") } : null;

    return this.publicMethod("Assets", assetParams) as Promise<GetAssetsResponse>;
  }

  /**
   * Returns the current Kraken asset pair infos as stated in https://www.kraken.com/help/api#get-tradable-pairs
   **/
  public getAssetPairs(params: GetAssetPairsRequest = {}) {
    const pairParams =
      params.pairs && params.pairs.length > 0 ? { pair: params.pairs.join(",") } : null;

    return this.publicMethod("AssetPairs", pairParams) as Promise<GetAssetPairsResponse>;
  }

  /**
   * Returns the current Kraken ticker infos as stated in https://www.kraken.com/help/api#get-ticker-info
   **/
  public getTicker(params: any) {
    return this.publicMethod("Ticker", params);
  }

  /**
   * Returns the current Kraken OHLC data infos as stated in https://www.kraken.com/help/api#get-ohlc-data
   **/
  public getOHLC(params: any) {
    return this.publicMethod("OHLC", params);
  }

  /**
   * Returns the current Kraken asset pair depth as stated in https://www.kraken.com/help/api#get-order-book
   **/
  public getDepth(params: any) {
    return this.publicMethod("Depth", params);
  }

  /**
   * Returns the most recent listed trades on Kraken as stated in https://www.kraken.com/help/api#get-recent-trades
   **/
  public getTrades(params: any) {
    return this.publicMethod("Trades", params);
  }

  /**
   * Returns the most recent spread data available on Kraken as stated in https://www.kraken.com/help/api#get-recent-spread-data
   **/
  public getSpread(params: any) {
    return this.publicMethod("Spread", params);
  }

  /**
   * Returns the current balance on Kraken for the user as stated in https://www.kraken.com/help/api#get-account-balance
   *
   * This function requires the API key and secret to be set, otherwise an error will be thrown.
   **/
  public getBalance() {
    return this.privateMethod("Balance");
  }

  /**
   * Returns the current trade balance on Kraken for the user as stated in https://www.kraken.com/help/api#get-trade-balance
   *
   * This function requires the API key and secret to be set, otherwise an error will be thrown.
   **/
  public getTradeBalance(params?: GetTradeBalanceRequest) {
    return this.privateMethod("TradeBalance", params);
  }

  /**
   * Returns the current list of open orders on Kraken for the user as stated in https://www.kraken.com/help/api#get-open-orders
   *
   * This function requires the API key and secret to be set, otherwise an error will be thrown.
   **/
  public getOpenOrders(params: any) {
    return this.privateMethod("OpenOrders", params);
  }

  /**
   * Returns the current list of closed orders on Kraken for the user as stated in https://www.kraken.com/help/api#get-closed-orders
   *
   * This function requires the API key and secret to be set, otherwise an error will be thrown.
   **/
  public getClosedOrders(params: any) {
    return this.privateMethod("ClosedOrders", params);
  }

  public queryOrders(params: any) {
    return this.privateMethod("QueryOrders", params);
  }

  public getTradesHistory(params: any) {
    return this.privateMethod("TradesHistory", params);
  }

  public queryTrades(params: any) {
    return this.privateMethod("QueryTrades", params);
  }

  public getOpenPositions(params: any) {
    return this.privateMethod("OpenPositions");
  }

  public getLedgers(params: any) {
    return this.privateMethod("Ledgers", params);
  }

  public queryLedgers(params: any) {
    return this.privateMethod("QueryLedgers", params);
  }

  public getTradeVolume(params: any) {
    return this.privateMethod("TradeVolume", params);
  }

  public addOrder(params: any) {
    return this.privateMethod("AddOrder", params);
  }

  public cancelOrder(params: any) {
    return this.privateMethod("CancelOrder", params);
  }

  public getDepositMethods(params: any) {
    return this.privateMethod("DepositMethods", params);
  }

  public getDepositAddresses(params: any) {
    return this.privateMethod("DepositAddresses", params);
  }

  public getDepositStatus(params: any) {
    return this.privateMethod("DepositStatus", params);
  }

  public getWithdrawInfo(params: any) {
    return this.privateMethod("WithdrawInfo", params);
  }

  public withdraw(params: any) {
    return this.privateMethod("Withdraw", params);
  }

  public getWithdrawStatus(params: any) {
    return this.privateMethod("WithdrawStatus", params);
  }

  public cancelWithdraw(params: any) {
    return this.privateMethod("WithdrawCancel", params);
  }

  private publicMethod(method: string, params: object | null = {}) {
    params = params || {};
    var url = `${this.config.url}/${this.config.version}/public/${method}`;

    return this.rawRequest(url, {}, querystringify(params));
  }

  private privateMethod(method: string, params: object | null = {}) {
    if (!this.config.key || !this.config.secret) {
      throw new Error(
        `The API key or secret are not set: [key: ${this.config.key}, secret: ${this.config.secret}]`,
      );
    }

    var path = `/${this.config.version}/private/${method}`;
    var url = this.config.url + path;

    const nonce = Date.now();
    const paramsWithNonce = { nonce, ...params };
    const messageBody = querystringify(paramsWithNonce);

    var signature = this.getMessageSignature(path, messageBody, this.config.secret, nonce);

    var headers = {
      "API-Key": this.config.key,
      "API-Sign": signature,
    };

    return this.rawRequest(url, headers, messageBody);
  }

  /**
   *
   * @param path e.g. /0/private/Balance
   * @param message Including nonce and *querystringified* e.g. nonce=1562254580075&asset=ZEUR
   * @param secret API secret in Base-64 e.g. 32MXEi...jUA==
   * @param nonce as a number e.g. 1562254580075
   */

  private getMessageSignature(path: string, message: string, secret: string, nonce: number) {
    const binaryHash = crypto.sha256AsBinary(nonce + message);
    const binaryPath = encoding.stringToBinary(path);

    const binaryPathAndHash = encoding.binaryConcat(binaryPath, binaryHash);
    const hmac = crypto.hmacSha512(binaryPathAndHash, secret);

    const hmacDigest = encoding.binaryToBase64(hmac);
    return hmacDigest;
  }

  private async rawRequest(url: string, headers: { [k: string]: string }, body: string) {
    // Set custom User-Agent string
    headers = {
      // "User-Agent": "Kraken Typescript API Client",
      // "Access-Control-Allow-Origin": "*",
      ...headers,
    };

    // let paramsWithoutNonce = { ...params };
    // delete paramsWithoutNonce["nonce"];

    var options: AxiosRequestConfig = {
      method: "POST",
      url,
      headers,
      // params: paramsWithoutNonce,
      data: body,
      timeout: this.config.timeout,
    };

    const response = await axios(options);

    if (response.status !== 200) {
      throw new Error(`Error in server response: ${JSON.stringify(response)}`);
    }

    const { data } = response;

    if (!data) {
      throw new Error(`Data returned is empty: ${JSON.stringify(response)}`);
    }

    if (data.error && data.error.length > 0) {
      var krakenErrors = (data.error as string[])
        .filter(e => e.startsWith("E"))
        .map(e => e.substr(1));

      if (krakenErrors.length === 0) {
        throw new Error(`Kraken API returned an unknown error: ${JSON.stringify(data.error)}`);
      } else if (krakenErrors.length > 0) {
        throw new Error(`Kraken API returned errors: ${krakenErrors.join("; ")}`);
      }
    }

    return data.result;
  }
}

interface Config {
  url: string;
  version: string;
  timeout: number;
  key?: string;
  secret?: string;
}

interface Response<T> {
  error: string[];
  result: T;
}

type KrakenAsset = LiteralUnion<"USD" | "EUR" | "BTC" | "ETH">;

interface GetTimeResponse {
  unixtime: number;
  rfc1123: string;
}

interface GetAssetsRequest {
  assets?: KrakenAsset[];
}

interface GetAssetsResponse {
  [asset: string]: {
    aclass: "currency";
    altname: string;
    decimals: number;
    display_decimals: number;
  };
}

interface GetAssetPairsRequest {
  pairs?: string[];
}

interface GetAssetPairsResponse {
  [pair: string]: {
    altname: string;
    wsname: string;
    pair_decimals: number;
    lot_decimals: number;
    lot_multiplier: number;
    leverage_buy: number[];
    leverage_sell: number[];
  };
}

interface GetTradeBalanceRequest {
  asset?: KrakenAsset;
}
