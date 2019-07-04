import { LiteralUnion } from "../util";

export type Timestamp = number;

export const KnownExchanges = ["kraken", "binance"] as const;
export type Exchange = typeof KnownExchanges[number];

export const WellKnownFiatAssets = ["EUR", "USD", "GBP", "CAD", "JPY", "KRW"] as const;
export type WellKnownFiatAssets = typeof WellKnownFiatAssets[number];

export const WellKnownCryptoAssets = ["BTC", "ETH", "BCH", "ETC", "USDT"] as const;
export type WellKnownCryptoAssets = typeof WellKnownCryptoAssets[number];

export type Asset = LiteralUnion<WellKnownFiatAssets | WellKnownCryptoAssets>;
