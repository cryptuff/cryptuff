/**
 * Kraken accepts inputs in most common assets, e.g. `https://api.kraken.com/0/public/Assets?asset=ETH`
 * but uses its own format in responses (e.g. `XETH`).
 *
 * Use these utilities to convert between both formats
 */

import { WellKnownFiatAssets } from "../../models/common";

const FIAT_ASSETS = (WellKnownFiatAssets as unknown) as string[];
const FIAT_REGEX = /^Z[A-Z]{3}/;
const CRYPTO_REGEX = /^X[A-Z]{3}/;

export function toKrakenAsset(commonAsset: string) {
  switch (commonAsset) {
    case "DOGE":
      return "XDG";
    case "BTC":
      return "XBT";
  }

  // Despite returning its own formats, Kraken accepts inputs in common notation so no need for this
  // if (FIAT_ASSETS.includes(commonAsset)) return `Z${commonAsset}`;

  return commonAsset;
}

export function toCommonAsset(krakenAsset: string) {
  switch (krakenAsset) {
    case "XXDG":
    case "XDG":
      return "DOGE";
    case "XXBT":
    case "XBT":
      return "BTC";
  }
  if (FIAT_REGEX.test(krakenAsset)) {
    return krakenAsset.slice(1);
  }
  if (CRYPTO_REGEX.test(krakenAsset)) {
    return krakenAsset.slice(1);
  }
  return krakenAsset;
}
