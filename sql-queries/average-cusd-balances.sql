-- Naive attempt at doing the entire calculation of an average over 12 snapshots in Dune
-- This query does only average cUSD in USD over all snapshots and can be used to cross-check
-- against the computed averages from the scripts in this repo
WITH
  -- poor man's version of defining re-usable variables in Dune
  snapshot1 as (
    SELECT
      TIMESTAMP '2022-11-15 12:00:00' AS time
  ),
  snapshot2 as (
    SELECT
      TIMESTAMP '2022-12-15 12:00:00' AS time
  ),
  snapshot3 as (
    SELECT
      TIMESTAMP '2023-01-15 12:00:00' AS time
  ),
  snapshot4 as (
    SELECT
      TIMESTAMP '2023-02-15 12:00:00' AS time
  ),
  snapshot5 as (
    SELECT
      TIMESTAMP '2023-03-15 12:00:00' AS time
  ),
  snapshot6 as (
    SELECT
      TIMESTAMP '2023-04-15 12:00:00' AS time
  ),
  snapshot7 as (
    SELECT
      TIMESTAMP '2023-05-15 12:00:00' AS time
  ),
  snapshot8 as (
    SELECT
      TIMESTAMP '2023-06-15 12:00:00' AS time
  ),
  snapshot9 as (
    SELECT
      TIMESTAMP '2023-07-15 12:00:00' AS time
  ),
  snapshot10 as (
    SELECT
      TIMESTAMP '2023-08-15 12:00:00' AS time
  ),
  snapshot11 as (
    SELECT
      TIMESTAMP '2023-09-15 12:00:00' AS time
  ),
  snapshot12 as (
    SELECT
      TIMESTAMP '2023-10-15 12:00:00' AS time
  ),
  cUSD_price_1 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot1
        )
      )
    LIMIT
      1
  ),
  cUSD_price_2 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot2
        )
      )
    LIMIT
      1
  ),
  cUSD_price_3 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot3
        )
      )
    LIMIT
      1
  ),
  cUSD_price_4 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot4
        )
      )
    LIMIT
      1
  ),
  cUSD_price_5 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot5
        )
      )
    LIMIT
      1
  ),
  cUSD_price_6 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot6
        )
      )
    LIMIT
      1
  ),
  cUSD_price_7 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot7
        )
      )
    LIMIT
      1
  ),
  cUSD_price_8 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot8
        )
      )
    LIMIT
      1
  ),
  cUSD_price_9 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot9
        )
      )
    LIMIT
      1
  ),
  cUSD_price_10 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot10
        )
      )
    LIMIT
      1
  ),
  cUSD_price_11 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot11
        )
      )
    LIMIT
      1
  ),
  cUSD_price_12 AS (
    SELECT
      minute,
      price
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a
      AND minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot12
        )
      )
    LIMIT
      1
  ),
  cUSD_inflow_1 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot1
      )
    GROUP BY
      to
  ),
  cUSD_inflow_2 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot2
      )
    GROUP BY
      to
  ),
  cUSD_inflow_3 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot3
      )
    GROUP BY
      to
  ),
  cUSD_inflow_4 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot4
      )
    GROUP BY
      to
  ),
  cUSD_inflow_5 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot5
      )
    GROUP BY
      to
  ),
  cUSD_inflow_6 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot6
      )
    GROUP BY
      to
  ),
  cUSD_inflow_7 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot7
      )
    GROUP BY
      to
  ),
  cUSD_inflow_8 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot8
      )
    GROUP BY
      to
  ),
  cUSD_inflow_9 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot9
      )
    GROUP BY
      to
  ),
  cUSD_inflow_10 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot10
      )
    GROUP BY
      to
  ),
  cUSD_inflow_11 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot11
      )
    GROUP BY
      to
  ),
  cUSD_inflow_12 AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot12
      )
    GROUP BY
      to
  ),
  cUSD_outflow_1 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot1
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_2 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot2
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_3 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot3
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_4 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot4
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_5 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot5
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_6 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot6
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_7 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot7
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_8 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot8
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_9 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot9
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_10 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot10
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_11 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot11
      )
    GROUP BY
      "from"
  ),
  cUSD_outflow_12 AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      mento_celo.StableToken_evt_Transfer
    WHERE
      evt_block_time <= (
        SELECT
          time
        from
          snapshot12
      )
    GROUP BY
      "from"
  ),
  cUSD_1 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_1 as inflow
      LEFT OUTER JOIN cUSD_outflow_1 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_1 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot1
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_2 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_2 as inflow
      LEFT OUTER JOIN cUSD_outflow_2 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_2 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot2
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_3 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_3 as inflow
      LEFT OUTER JOIN cUSD_outflow_3 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_3 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot3
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_4 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_4 as inflow
      LEFT OUTER JOIN cUSD_outflow_4 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_4 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot4
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_5 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_5 as inflow
      LEFT OUTER JOIN cUSD_outflow_5 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_5 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot5
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_6 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_6 as inflow
      LEFT OUTER JOIN cUSD_outflow_6 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_6 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot6
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_7 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_7 as inflow
      LEFT OUTER JOIN cUSD_outflow_7 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_7 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot7
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_8 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_8 as inflow
      LEFT OUTER JOIN cUSD_outflow_8 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_8 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot8
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_9 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_9 as inflow
      LEFT OUTER JOIN cUSD_outflow_9 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_9 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot9
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_10 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) AS balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_10 as inflow
      LEFT OUTER JOIN cUSD_outflow_10 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_10 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot10
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_11 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_11 as inflow
      LEFT OUTER JOIN cUSD_outflow_11 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_11 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot11
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  ),
  cUSD_12 AS (
    SELECT
      inflow.address AS address,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) AS balance,
      COALESCE(TRY((inflow.total - outflow.total) / 1e18 * p.price), 0) balance_in_usd,
      p.price AS price
    FROM
      cUSD_inflow_12 as inflow
      LEFT OUTER JOIN cUSD_outflow_12 AS outflow ON inflow.address = outflow.address
      LEFT OUTER JOIN cUSD_price_12 p ON p.minute = date_trunc(
        'minute',
        (
          SELECT
            time
          from
            snapshot12
        )
      )
    WHERE
      COALESCE(TRY((inflow.total - outflow.total) / 1e18), 0) > 10
    ORDER BY
      balance DESC
  )
  --
  --
  -- Combine balances & prices into final output table
  --
  --
SELECT
  address,
  SUM(balance_in_usd) / 12 as "Average Balance in USD",
  SUM(balance) / 12 as "Average Raw Balance"
FROM
  (
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_1
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_2
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_3
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_4
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_5
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_6
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_7
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_8
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_9
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_10
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_11
    UNION ALL
    SELECT
      address,
      balance_in_usd,
      balance
    FROM
      cUSD_12
  ) combined_snapshots
GROUP BY
  address
ORDER BY
  AVG(balance_in_usd) DESC