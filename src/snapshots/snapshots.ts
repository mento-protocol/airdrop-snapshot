export type Snapshot = {
  date: Date
  pricesInUsd: Prices
}

export type Prices = {
  cUSD: number
  cEUR: number
  cREAL: number
  celo: number
}

// NOTE: prices were looked up manually from Dune via this query https://dune.com/queries/3186790
export const snapshotDates: Snapshot[] = [
  {
    date: new Date('2022-11-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.983953,
      cEUR: 1.013312,
      cREAL: 0.18750714999999998,
      celo: 0.426718,
    },
  },
  {
    date: new Date('2022-12-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.988202,
      cEUR: 1.015267,
      cREAL: 0.18820770096774192,
      celo: 0.598212,
    },
  },
  {
    date: new Date('2023-01-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.992729,
      cEUR: 1.083905,
      cREAL: 0.19646470666666668,
      celo: 0.633701,
    },
  },
  {
    date: new Date('2023-02-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.996661,
      cEUR: 1.067157,
      cREAL: 0.1917083226923077,
      celo: 0.75733,
    },
  },
  {
    date: new Date('2023-03-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.998036,
      cEUR: 1.04696,
      cREAL: 0.18872989409090907,
      celo: 0.637188,
    },
  },
  {
    date: new Date('2023-04-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.997667,
      cEUR: 1.087143,
      cREAL: 0.203623585,
      celo: 0.718663,
    },
  },
  {
    date: new Date('2023-05-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.996772,
      cEUR: 1.080151,
      cREAL: 0.20361686596153847,
      celo: 0.531573,
    },
  },
  {
    date: new Date('2023-06-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.996096,
      cEUR: 1.056419,
      cREAL: 0.20760043753846155,
      celo: 0.392675,
    },
  },
  {
    date: new Date('2023-07-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.998269,
      cEUR: 1.11057,
      cREAL: 0.20871648200000004,
      celo: 0.509328,
    },
  },
  {
    date: new Date('2023-08-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.993201,
      cEUR: 1.083049,
      cREAL: 0.20079055210526317,
      celo: 0.486467,
    },
  },
  {
    date: new Date('2023-09-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.997878,
      cEUR: 1.062917,
      cREAL: 0.2053957851351351,
      celo: 0.420686,
    },
  },
  {
    date: new Date('2023-10-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 1.000026,
      cEUR: 1.053861,
      cREAL: 0.197430604,
      celo: 0.420397,
    },
  },
  {
    date: new Date('2023-11-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.999596,
      cEUR: 1.084247,
      cREAL: 0.2056700075,
      celo: 0.554847,
    },
  },
  {
    date: new Date('2023-12-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 0.999658,
      cEUR: 1.095831,
      cREAL: 0.20273413282608696,
      celo: 0.589114,
    },
  },
  {
    date: new Date('2024-01-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 1.000097,
      cEUR: 1.091922,
      cREAL: 0.20571925123595503,
      celo: 0.766045,
    },
  },
  {
    date: new Date('2024-02-15 12:00 UTC'),
    pricesInUsd: {
      cUSD: 1.002395,
      cEUR: 1.074036,
      cREAL: 0.20119799760000004,
      celo: 0.764104,
    },
  },
]

export default snapshotDates
