import type { Snapshot } from './types.js'

// NOTE: prices were looked up manually from Dune via this query https://dune.com/queries/3186790
export const snapshotDates: Snapshot[] = [
  {
    date: new Date('2022-11-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.983953,
      cEUR: 1.013312,
      cREAL: 0.18750714999999998,
    },
  },
  {
    date: new Date('2022-12-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.988202,
      cEUR: 1.015267,
      cREAL: 0.18820770096774192,
    },
  },
  {
    date: new Date('2023-01-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.992729,
      cEUR: 1.083905,
      cREAL: 0.19646470666666668,
    },
  },
  {
    date: new Date('2023-02-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.996661,
      cEUR: 1.067157,
      cREAL: 0.1917083226923077,
    },
  },
  {
    date: new Date('2023-03-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.998036,
      cEUR: 1.04696,
      cREAL: 0.18872989409090907,
    },
  },
  {
    date: new Date('2023-04-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.997667,
      cEUR: 1.087143,
      cREAL: 0.203623585,
    },
  },
  {
    date: new Date('2023-05-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.996772,
      cEUR: 1.080151,
      cREAL: 0.20361686596153847,
    },
  },
  {
    date: new Date('2023-06-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.996096,
      cEUR: 1.056419,
      cREAL: 0.20760043753846155,
    },
  },
  {
    date: new Date('2023-07-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.998269,
      cEUR: 1.11057,
      cREAL: 0.20871648200000004,
    },
  },
  {
    date: new Date('2023-08-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.993201,
      cEUR: 1.083049,
      cREAL: 0.20079055210526317,
    },
  },
  {
    date: new Date('2023-09-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.997878,
      cEUR: 1.062917,
      cREAL: 0.2053957851351351,
    },
  },
  {
    date: new Date('2023-10-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 1.000026,
      cEUR: 1.053861,
      cREAL: 0.197430604,
    },
  },
]

export default snapshotDates
