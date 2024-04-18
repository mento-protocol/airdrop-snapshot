WITH
  -- Get the USD price of CELO at the snapshot time
  celo_usd_price AS (
    SELECT
      symbol,
      price,
      minute "time"
    FROM
      prices.usd
    WHERE
      blockchain = 'celo'
      AND contract_address = 0x471ece3750da237f93b8e339c536989b8978a438 -- CELO https://celoscan.io/token/0x471ece3750da237f93b8e339c536989b8978a438
      AND minute = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
    LIMIT
      1
  ),
  -- Get all received stCELO
  stCELO_inflow AS (
    SELECT
      to AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      staked_celo.stCELO_evt_Transfer
    WHERE
      evt_block_time <= TIMESTAMP '{{snapshot time}}'
    GROUP BY
      to
  ),
  -- Get all spent stCELO
  stCELO_outflow AS (
    SELECT
      "from" AS address,
      COALESCE(SUM(value), CAST(0 AS uint256)) AS total
    FROM
      staked_celo.stCELO_evt_Transfer
    WHERE
      evt_block_time <= TIMESTAMP '{{snapshot time}}'
    GROUP BY
      "from"
  ),
  --
  -- Calculate balance at snapshot time: `received - spent = balance at snapshot time`
  stCELO AS (
    SELECT
      inflow.address AS address,
      COALESCE(
        TRY(
          (
            COALESCE(inflow.total, 0) - COALESCE(outflow.total, 0)
          ) / 1e18
        ),
        0
      ) AS balance
    FROM
      stCELO_inflow as inflow
      LEFT OUTER JOIN stCELO_outflow AS outflow ON inflow.address = outflow.address
    WHERE
      -- Min. 10 stCELO to filter out low balances & dust.
      -- This is not to discriminate against smaller holders but rather avoid a situation where 
      -- gas costs for claiming the airdrop would be higher than the actual airdrop amount
      COALESCE(TRY((COALESCE(inflow.total, 0) - COALESCE(outflow.total, 0)) / 1e18), 0) > 10

    ORDER BY
      balance DESC
  )
SELECT
  -- For exporting to CSV from Dune, flip this on and comment out the next column get a cleaner address column in the export CSV
  stCELO.address as Address,
  '<a href=https://celoscan.io/address/' || cast(stCELO.address as varchar) || ' target=_blank>' || cast(stCELO.address as varchar) || '</a>' as Address,
  stCELO.balance as "stCELO Balance",
  -- ❗ NOTE: This isn't completely accurate because CELO <> stCELO isn't 1:1 but there's no accessible price feed for stCELO on Dune so as an approximation this has to suffice
  stCELO.balance * p.price as "stCELO in USD (approximate)",
  -- including a column with address metadata for contract addresses to simplify manual snapshot review
  CASE
  -- If there's a contract creation TX hash for this address, it means it should be contract (and not an EOA)
    WHEN creation_trace.tx_hash IS NOT NULL THEN (
      CASE
      -- If the address is on the safe_celo.safes Dune table, label it as 'Gnosis Safe'
        WHEN gnosis_safe.tx_hash IS NOT NULL THEN 'Gnosis Safe'
        -- else if Dune has a contract name (available for many verified contracts), use the contract name.
        -- (annoyingly, some contracts have more than 1 name which is why this complicated merging of contract names into 1 column is required)
        WHEN array_join(array_agg(contract.name), '/') != '' THEN array_join(array_agg(contract.name), '/')
        -- else tag it as 'unverified'
        ELSE 'yes (but no data on dune)'
      END
    )
    ELSE NULL
  END as "Contract",
  TIMESTAMP '{{snapshot time}}' as "Snapshot Time"
FROM
  stCELO
  LEFT JOIN celo.contracts "contract" ON contract.address = stCELO.address
  LEFT JOIN celo.creation_traces "creation_trace" ON creation_trace.address = stCELO.address
  LEFT JOIN safe_celo.safes "gnosis_safe" ON gnosis_safe.address = stCELO.address
  LEFT JOIN celo_usd_price p ON p.time = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
GROUP BY
  stCELO.balance,
  stCELO.address,
  p.price,
  creation_trace.tx_hash,
  gnosis_safe.tx_hash
ORDER BY
  stCELO.balance DESC