export interface ITickerRequest {
  exchange: string;
  pair: string;
}

export interface ITickerResponse {
  price: number;
}
