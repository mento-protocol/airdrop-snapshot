export type Snapshot = {
  date: Date
  pricesInUsd: Prices
}

export type Prices = {
  cUSD: number
  cEUR: number
  cREAL: number
}
