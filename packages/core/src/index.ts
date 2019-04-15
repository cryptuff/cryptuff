export * from "./interfaces";
export * from "./models";
export * from "./pdsmethods";
export { KrakenClient } from "./exchange/kraken";
import { Kraken } from "./exchange/kraken";
export { Kraken };
export type KrakenTrade = Kraken.InboundMessages.Trade;

export const CRYPTUFF_REALM = "com.cryptuff";
export const Core = "7";
export const X = 3;
// export const Methods = _Methods;
