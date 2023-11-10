WITH
    --
    --
    -- Prices
    --
    -- Combine cUSD, cEUR, and BRL prices in one table 
    average_prices AS (
        SELECT
            symbol,
            AVG(price) average_price
        FROM
            prices.usd
        WHERE
            blockchain = 'celo'
            AND contract_address IN (
                -- cUSD https://celoscan.io/address/0x765DE816845861e75A25fCA122bb6898B8B1282a
                0x765DE816845861e75A25fCA122bb6898B8B1282a,
                -- cEUR https://celoscan.io/address/0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73
                0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73
            )
            -- We want the average price within the snapshot timeframe
            AND minute >= date_trunc ('minute', TIMESTAMP '{{from}}')
            AND minute <= date_trunc ('minute', TIMESTAMP '{{to}}')
        GROUP BY
            symbol,
            contract_address
        UNION ALL
        --
        -- There's no easily accessible cREAL price feed in Dune, so we use a chainlink
        -- price feed to get BRL prices and get them into the prior table via UNION ALL
        SELECT
            base as symbol, -- Match schema of prices.usd table
            AVG(oracle_price) price
        FROM
            chainlink.price_feeds
        WHERE
            base = 'BRL'
            AND quote = 'USD'
            AND block_date >= DATE (TIMESTAMP '{{from}}')
            AND block_date <= DATE (TIMESTAMP '{{to}}')
        GROUP BY
            base
    ),
    --
    --
    -- cUSD
    --
    -- Get all received cUSD
    cUSD_inflow AS (
        SELECT
            to AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableToken_evt_Transfer
        WHERE
            evt_block_time >= TIMESTAMP '{{from}}'
            AND evt_block_time <= TIMESTAMP '{{to}}'
        GROUP BY
            to
    ),
    -- Get all spent cUSD
    cUSD_outflow AS (
        SELECT
            "from" AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableToken_evt_Transfer
        WHERE
            evt_block_time >= TIMESTAMP '{{from}}'
            AND evt_block_time <= TIMESTAMP '{{to}}'
        GROUP BY
            "from"
    ),
    -- Calculate total cUSD volume: `inflow + outflow = volume`
    cUSD_volume as (
        SELECT
            address,
            SUM(total) / 1e18 AS volume,
            (SUM(total) / 1e18) * (
                SELECT
                    average_price
                FROM
                    average_prices
                WHERE
                    symbol = 'cUSD'
            ) AS volume_in_usd
        FROM
            -- Can't use JOIN because there can be addresses that had ONLY outflows and won't appear on the inflow table (because inflows via block rewards don't emit `Transfer` events)
            (
                SELECT
                    address,
                    total
                FROM
                    cUSD_inflow
                UNION ALL
                SELECT
                    address,
                    total
                FROM
                    cUSD_outflow
            )
        GROUP BY
            address
    ),
    --
    --
    -- cEUR
    --
    -- Get all received cEUR
    cEUR_inflow AS (
        SELECT
            to AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenEUR_evt_Transfer
        WHERE
            evt_block_time >= TIMESTAMP '{{from}}'
            AND evt_block_time <= TIMESTAMP '{{to}}'
        GROUP BY
            to
    ),
    -- Get all spent cEUR
    cEUR_outflow AS (
        SELECT
            "from" AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenEUR_evt_Transfer
        WHERE
            evt_block_time >= TIMESTAMP '{{from}}'
            AND evt_block_time <= TIMESTAMP '{{to}}'
        GROUP BY
            "from"
    ),
    -- Calculate total cEUR volume: `inflow + outflow = volume`
    cEUR_volume as (
        SELECT
            address,
            SUM(total) / 1e18 AS volume,
            (SUM(total) / 1e18) * (
                SELECT
                    average_price
                FROM
                    average_prices
                WHERE
                    symbol = 'cEUR'
            ) AS volume_in_usd
        FROM
            -- Can't use JOIN because there can be addresses that had ONLY outflows and won't appear on the inflow table (because inflows via block rewards don't emit `Transfer` events)
            (
                SELECT
                    address,
                    total
                FROM
                    cEUR_inflow
                UNION ALL
                SELECT
                    address,
                    total
                FROM
                    cEUR_outflow
            )
        GROUP BY
            address
    ),
    --
    --
    -- cREAL
    --
    -- Get all received cREAL
    cREAL_inflow AS (
        SELECT
            to AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenBRL_evt_Transfer
        WHERE
            evt_block_time >= TIMESTAMP '{{from}}'
            AND evt_block_time <= TIMESTAMP '{{to}}'
        GROUP BY
            to
    ),
    -- Get all spent cREAL
    cREAL_outflow AS (
        SELECT
            "from" AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenBRL_evt_Transfer
        WHERE
            evt_block_time >= TIMESTAMP '{{from}}'
            AND evt_block_time <= TIMESTAMP '{{to}}'
        GROUP BY
            "from"
    ),
    -- Calculate total cREAL volume: `inflow + outflow = volume`
    cREAL_volume as (
        SELECT
            address,
            SUM(total) / 1e18 AS volume,
            (SUM(total) / 1e18) * (
                SELECT
                    average_price
                FROM
                    average_prices
                WHERE
                    symbol = 'BRL'
            ) AS volume_in_usd
        FROM
            -- Can't use JOIN because there can be addresses that had ONLY outflows and won't appear on the inflow table (because inflows via block rewards don't emit `Transfer` events)
            (
                SELECT
                    address,
                    total
                FROM
                    cREAL_inflow
                UNION ALL
                SELECT
                    address,
                    total
                FROM
                    cREAL_outflow
            )
        GROUP BY
            address
    )
    --
    --
    --
    -- Combine total volumes into final output table
    --
SELECT
    '<a href=https://celoscan.io/address/' || cast(
        COALESCE(cUSD.address, cEUR.address, cREAL.address) as varchar
    ) || ' target=_blank>' || cast(
        COALESCE(cUSD.address, cEUR.address, cREAL.address) as varchar
    ) || '</a>' as Address,
    COALESCE(cUSD.volume_in_usd, 0) + COALESCE(cEUR.volume_in_usd, 0) + COALESCE(cREAL.volume_in_usd, 0) "Total Volume in USD",
    cUSD.volume_in_usd "cUSD Volume in USD",
    cEUR.volume_in_usd "cEUR Volume in USD",
    cREAL.volume_in_usd "cREAL Volume in USD",
    -- including a column with address metadata for contract addresses to simplify manual snapshot review
    CASE
    -- If there's a contract creation TX hash for this address, it means it should be contract (and not an EOA)
        WHEN creation_trace.tx_hash IS NOT NULL THEN (
            CASE
            -- If the address is on the safe_celo.safes Dune table, label it as 'Gnosis Safe'
                WHEN gnosis_safe.tx_hash IS NOT NULL THEN 'Gnosis Safe'
                -- else if Dune has a contract name (available for many verified contracts), use the contract name.
                -- (annoyingly, some contracts have more than 1 name which is why this complicated merging of contract names into 1 column is required)
                WHEN array_join (array_agg (contract.name), ', ') != '' THEN array_join (array_agg (contract.name), ', ')
                -- else tag it as 'unverified'
                ELSE 'unverified'
            END
        )
        ELSE NULL
    END AS "Contract",
    cUSD.volume "cUSD Volume",
    cEUR.volume "cEUR Volume",
    cREAL.volume "cREAL Volume"
FROM
    cUSD_volume cUSD
    FULL OUTER JOIN cEUR_volume cEUR ON cUSD.address = cEUR.address
    FULL OUTER JOIN cREAL_volume cREAL ON (
        cEUR.address = cREAL.address
        OR cUSD.address = cREAL.address
    )
    LEFT JOIN celo.contracts "contract" ON contract.address = COALESCE(cUSD.address, cEUR.address, cREAL.address)
    LEFT JOIN celo.creation_traces "creation_trace" ON creation_trace.address = COALESCE(cUSD.address, cEUR.address, cREAL.address)
    LEFT JOIN safe_celo.safes "gnosis_safe" ON gnosis_safe.address = COALESCE(cUSD.address, cEUR.address, cREAL.address)
WHERE
    -- min. $10 USD total volume to qualify
    COALESCE(cUSD.volume_in_usd, 0) + COALESCE(cEUR.volume_in_usd, 0) + COALESCE(cREAL.volume_in_usd, 0) >= 100
    AND COALESCE(cUSD.address, cEUR.address, cREAL.address) != 0x0000000000000000000000000000000000000000
    --
    -- This group-by clause is necessary because 1 address can possibly have multiple contract names on
    -- the celo.contracts table which would lead to multiple rows for the same address potentially leading
    -- to double-counting for eligibility.
GROUP BY
    COALESCE(cUSD.address, cEUR.address, cREAL.address),
    creation_trace.tx_hash,
    gnosis_safe.tx_hash,
    cUSD.volume,
    cUSD.volume_in_usd,
    cEUR.volume,
    cEUR.volume_in_usd,
    cREAL.volume,
    cREAL.volume_in_usd
ORDER BY
    COALESCE(cUSD.volume_in_usd, 0) + COALESCE(cEUR.volume_in_usd, 0) + COALESCE(cREAL.volume_in_usd, 0) DESC