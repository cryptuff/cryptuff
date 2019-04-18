import { Exchange, Timestamp } from "./common";
import { Instrument } from "./instrument";

export interface MarketTrade {
  exchange: Exchange;
  instrument: Instrument;
  volume: number;
  price: number;
  timestamp: Timestamp;
}
