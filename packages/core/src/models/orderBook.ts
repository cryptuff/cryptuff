import { Timestamp, Exchange } from "./common";
import { Instrument } from "./instrument";

export interface OrderBookEntry {
  level: number;
  volume: number;
}

export interface OrderBookSnapshot {
  exchange: Exchange;
  instrument: Instrument;
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  lastUpdated: Timestamp;
}

export interface OrderBookDelta extends OrderBookEntry {
  timestamp: Timestamp;
}

export interface OrderBookDeltaSet {
  exchange: Exchange;
  instrument: Instrument;
  asks: OrderBookDelta[];
  bids: OrderBookDelta[];
  lastUpdated: Timestamp;
}
