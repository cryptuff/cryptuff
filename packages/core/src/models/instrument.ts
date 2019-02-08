export interface Instrument {
  token: string;
  quote: string;

  /**
   * Only if not a straight combination of token/quote
   */
  symbol?: string;
}
