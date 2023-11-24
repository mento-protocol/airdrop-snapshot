-- [Known Issues For This Query]
--
-- 1. VALIDATORS CAN'T BE PROPERLY ACCOUNTED FOR
--   Because block rewards are paid in cUSD and Dune does not index block reward information.
--   Concretely, the Celo blockchain is built in a way that does not emit a regular ERC20
--   `Transfer` event when block rewards are paid out which makes it hard to index them 
--   
--  Option A)
--  Exclude validators from this reward calculation and check balances at snapshots manually (i.e. via foundry fork and then balanceOf(validator))
-- 
--  Option B)
--  Accept that validators might get somewhat lower allocations because some of the inflows can't be captured via `Transfer` events
--
--  Option C)
--  Completely exclude validators from this snapshot and determine their allocation via other means
--
-- 2. cREAL DOES NOT HAVE A NATIVE DUNE PRICE FEED (on the `prices.usd` table)
--   The workaround we use is to just take a standard BRL/USD FX rate from Chainlink
--   which should be close enough but isn't 100% exact as it doesn't account for 
--   possible cREAL/BRL fluctuations
-- 
--
-- [Potential Improvements]
--
-- 1. Add column with labels
--   Dune has labeled many addresses (i.e. as "Institution", or "Kraken Deposit" etc).
--   To filter out addresses that shouldn't be eligible we could add a column that 
--  combines all labels which would require a bit of JOIN + string aggregation magic
WITH
    --
    -- cUSD
    --
    --
    -- Get cUSD price in USD at snapshot time
    cUSD_price AS (
        SELECT
            minute,
            price
        FROM
            prices.usd
        WHERE
            blockchain = 'celo'
            AND contract_address = 0x765DE816845861e75A25fCA122bb6898B8B1282a -- cUSD https://celoscan.io/address/0x765DE816845861e75A25fCA122bb6898B8B1282a
            AND minute = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
            -- 1 exchange rate price point that's close to the snapshot time should be good enough
            -- If we find any edge cases where price depegged for a few seconds at snapshot time we could switch to a daily average  
        LIMIT
            1
    ),
    --
    -- Get all received cUSD
    cUSD_inflow AS (
        SELECT
            to AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableToken_evt_Transfer
        WHERE
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
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
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
        GROUP BY
            "from"
    ),
    --
    -- Calculate balance at snapshot time: `received - spent = balance at snapshot time`
    cUSD AS (
        SELECT
            inflow.address AS address,
            COALESCE(
                TRY (
                    (
                        COALESCE(inflow.total, 0) - COALESCE(outflow.total, 0)
                    ) / 1e18
                ),
                0
            ) AS balance,
            p.price AS price
        FROM
            cUSD_inflow as inflow
            LEFT OUTER JOIN cUSD_outflow AS outflow ON inflow.address = outflow.address
            LEFT OUTER JOIN cUSD_price p ON p.minute = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
        WHERE
            -- Min. 10 cUSD to filter out low balances & dust.
            -- This is not to discriminate against smaller holders but rather avoid a situation where 
            -- gas costs for claiming the airgrab would be higher than the actual airgrab amount
            COALESCE(TRY ((inflow.total - outflow.total) / 1e18), 0) > 10
        ORDER BY
            balance DESC
    ),
    --
    --
    -- cEUR
    --
    --
    --
    -- Get cEUR price in USD at snapshot time
    cEUR_price AS (
        SELECT
            minute,
            price
        FROM
            prices.usd
        WHERE
            blockchain = 'celo'
            AND contract_address = 0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73 -- cEUR https://celoscan.io/address/0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73
            AND minute = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
        LIMIT
            1
    ),
    --
    -- Get all received cEUR
    cEUR_inflow AS (
        SELECT
            to AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenEUR_evt_Transfer
        WHERE
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
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
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
        GROUP BY
            "from"
    ),
    --
    -- Calculate balance at snapshot time: `received - spent = balance at snapshot time`
    cEUR AS (
        SELECT
            inflow.address AS address,
            COALESCE(
                TRY (
                    (
                        COALESCE(inflow.total, 0) - COALESCE(outflow.total, 0)
                    ) / 1e18
                ),
                0
            ) AS balance,
            p.price AS price
        FROM
            cEUR_inflow as inflow
            LEFT OUTER JOIN cEUR_outflow AS outflow ON inflow.address = outflow.address
            LEFT OUTER JOIN cEUR_price p ON p.minute = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
        WHERE
            -- Min. 10 cEUR to filter out low balances & dust.
            -- This is not to discriminate against smaller holders but rather avoid a situation where 
            -- gas costs for claiming the airgrab would be higher than the actual airgrab amount
            COALESCE(TRY ((inflow.total - outflow.total) / 1e18), 0) > 10 -- min. 10 cEUR to filter out low balances & dust
        ORDER BY
            balance DESC
    ),
    --
    --
    -- cREAL
    --
    --
    -- Get BRL price in USD at snapshot time
    -- NOTE: Dune's `prices.usd` table doesn't support cREAL which is why we have to get BRL prices from a chainlink table instead
    BRL_price AS (
        SELECT
            block_date "date",
            -- There's not as many price points as for cUSD or cEUR which is why it's safer to average all price points at a certain date
            -- (i.e. average of all price points on 2023-08-15 instead of the exact price rate on 2023-08-15 00:00 which we use for cUSD and cEUR above)
            AVG(oracle_price) price
        FROM
            -- Sadly, Dune's `prices.usd` table has no price information for cREAL which is why have to fall back to chainlink's general BRL/USD feeds here
            chainlink.price_feeds
        WHERE
            base = 'BRL'
            AND quote = 'USD'
            -- speeds up query, only get price data from the day of the snapshot (instead of *all* price points on *all* days)
            AND block_date = DATE (TIMESTAMP '{{snapshot time}}')
        GROUP BY
            block_date
        ORDER BY
            block_date DESC
        LIMIT
            1
    ),
    --
    -- Get all received cREAL
    cREAL_inflow AS (
        SELECT
            to AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenBRL_evt_Transfer
        WHERE
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
        GROUP BY
            to
    ),
    --
    -- Get all spent cREAL
    cREAL_outflow AS (
        SELECT
            "from" AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            mento_celo.StableTokenBRL_evt_Transfer
        WHERE
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
        GROUP BY
            "from"
    ),
    --
    -- Calculate balance at snapshot time: `received - spent = balance at snapshot time`
    cREAL AS (
        SELECT
            inflow.address AS address,
            COALESCE(
                TRY (
                    (
                        COALESCE(inflow.total, 0) - COALESCE(outflow.total, 0)
                    ) / 1e18
                ),
                0
            ) AS balance,
            p.price AS price
        FROM
            cREAL_inflow as inflow
            LEFT OUTER JOIN cREAL_outflow as outflow ON inflow.address = outflow.address
            LEFT OUTER JOIN BRL_price p ON date_trunc ('day', p."date") = DATE (TIMESTAMP '{{snapshot time}}')
        WHERE
            COALESCE(TRY ((inflow.total - outflow.total) / 1e18), 0) > 10
        ORDER BY
            balance DESC
    )
    --
    --
    -- Combine balances & prices into final output table
    --
    --
SELECT
    -- For exporting to CSV from Dune, flip this on and comment out the next column get a cleaner address column in the export CSV
    -- COALESCE(cUSD.address, cEUR.address, cREAL.address) as Address,
    '<a href=https://celoscan.io/address/' || cast(
        COALESCE(cUSD.address, cEUR.address, cREAL.address) as varchar
    ) || ' target=_blank>' || cast(
        COALESCE(cUSD.address, cEUR.address, cREAL.address) as varchar
    ) || '</a>' as Address,
    COALESCE(cUSD.balance * cUSD.price, 0) + COALESCE(cEUR.balance * cEUR.price, 0) + COALESCE(cREAL.balance * cREAL.price, 0) "Total cStables in USD",
    COALESCE(cUSD.balance * cUSD.price, 0) "cUSD in USD",
    COALESCE(cEUR.balance * cEUR.price, 0) "cEUR in USD",
    COALESCE(cREAL.balance * cREAL.price, 0) "cREAL in USD",
    -- including a column with address metadata for contract addresses to simplify manual snapshot review
    CASE
    -- If there's a contract creation TX hash for this address, it means it should be contract (and not an EOA)
        WHEN creation_trace.tx_hash IS NOT NULL THEN (
            CASE
            -- If the address is on the safe_celo.safes Dune table, label it as 'Gnosis Safe'
                WHEN gnosis_safe.tx_hash IS NOT NULL THEN 'Gnosis Safe'
                -- else if Dune has a contract name (available for many verified contracts), use the contract name.
                -- (annoyingly, some contracts have more than 1 name which is why this complicated merging of contract names into 1 column is required)
                WHEN array_join (array_agg (contract.name), '/') != '' THEN array_join (array_agg (contract.name), '/')
                -- else tag it as 'unverified'
                ELSE 'unverified'
            END
        )
        ELSE NULL
    END AS "Contract",
    cUSD.balance "cUSD Balance",
    cEUR.balance "cEUR Balance",
    cREAL.balance "cREAL Balance"
FROM
    cUSD
    FULL OUTER JOIN cEUR ON cUSD.address = cEUR.address
    FULL OUTER JOIN cREAL ON (
        cEUR.address = cREAL.address
        OR cUSD.address = cREAL.address
    )
    LEFT JOIN celo.contracts "contract" ON contract.address = COALESCE(cUSD.address, cEUR.address, cREAL.address)
    LEFT JOIN celo.creation_traces "creation_trace" ON creation_trace.address = COALESCE(cUSD.address, cEUR.address, cREAL.address)
    LEFT JOIN safe_celo.safes "gnosis_safe" ON gnosis_safe.address = COALESCE(cUSD.address, cEUR.address, cREAL.address)
GROUP BY
    COALESCE(cUSD.address, cEUR.address, cREAL.address),
    COALESCE(cUSD.balance * cUSD.price, 0) + COALESCE(cEUR.balance * cEUR.price, 0) + COALESCE(cREAL.balance * cREAL.price, 0),
    COALESCE(cUSD.balance * cUSD.price, 0),
    COALESCE(cEUR.balance * cEUR.price, 0),
    COALESCE(cREAL.balance * cREAL.price, 0),
    creation_trace.tx_hash,
    gnosis_safe.tx_hash,
    cUSD.balance,
    cEUR.balance,
    cREAL.balance
ORDER BY
    COALESCE(cUSD.balance * cUSD.price, 0) + COALESCE(cEUR.balance * cEUR.price, 0) + COALESCE(cREAL.balance * cREAL.price, 0) DESC