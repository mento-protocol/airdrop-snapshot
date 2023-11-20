-- Known Issues
-- LockedCelo accrues yield which does not emit events.
-- Therefore the Dune balances should always be *lower*
-- than the actual balances because this yield can't be
-- accounted for without emitted events that Dune can index.
--
-- Solution
-- 1. Run this query for each snapshot to get a list of addresses with lockedCelo balances
-- 2. Export the results as a CSV
-- 3. Write a script that iterates over each address in the CSV and queries
--    the actual LockedCelo contract at the snapshot time for each address 
WITH
    locked AS (
        SELECT
            account AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            celo_celo.LockedGold_evt_GoldLocked
        WHERE
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
        GROUP BY
            account
    ),
    unlocked AS (
        SELECT
            account AS address,
            COALESCE(SUM(value), CAST(0 AS uint256)) AS total
        FROM
            celo_celo.LockedGold_evt_GoldUnlocked
        WHERE
            evt_block_time <= TIMESTAMP '{{snapshot time}}'
        GROUP BY
            account
    ),
    locked_balances AS (
        SELECT
            locked.address AS address,
            COALESCE(TRY ((locked.total - unlocked.total) / 1e18), 0) AS balance
        FROM
            locked
            LEFT OUTER JOIN unlocked ON locked.address = unlocked.address
        WHERE
            -- TODO: Remove the WHERE clause and try running the snapshot script with all addresses
            -- to check if there's any addresses that Dune shows as 0 but that actually had a lockedCelo
            -- balance on the snapshot date.
            COALESCE(TRY ((locked.total - unlocked.total) / 1e18), 0) >= CAST(1 as DOUBLE)
        ORDER BY
            balance DESC
    )
SELECT
    --   locked_balances.address as Address,
    '<a href=https://celoscan.io/address/' || cast(locked_balances.address as varchar) || ' target=_blank>' || cast(locked_balances.address as varchar) || '</a>' as Address,
    locked_balances.balance as "Locked CELO",
    CASE
        WHEN creation_trace.tx_hash IS NOT NULL THEN 'Contract'
        ELSE NULL
    END AS "Contract"
FROM
    locked_balances
    LEFT JOIN celo.creation_traces "creation_trace" ON creation_trace.address = locked_balances.address
ORDER BY
    balance DESC