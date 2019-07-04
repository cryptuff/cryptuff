/// <reference types="react-scripts" />

declare namespace NodeJS {
  export interface ProcessEnv {
    KRAKEN_ENDPOINT: string;
    ROUTER_ENDPOINT: string;
    REACT_APP_KRAKEN_API_KEY: string;
    REACT_APP_KRAKEN_API_SECRET: string;
    PORT: number;
  }
}
