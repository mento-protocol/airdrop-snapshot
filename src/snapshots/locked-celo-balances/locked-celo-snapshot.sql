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
            -- The inner COALESCE is to handle the case where there are no unlocked balances for an address.
            -- i.e. the address could have locked CELO but never unlocked any, which would make `unlocked.total`
            -- NULL here and cause the subtraction to fail. (because 100 - NULL = NULL)
            COALESCE(
                TRY (
                    (
                        COALESCE(locked.total, 0) - COALESCE(unlocked.total, 0)
                    ) / 1e18
                ),
                0
            ) AS balance
        FROM
            locked
            LEFT OUTER JOIN unlocked ON locked.address = unlocked.address
            -- For debug purposes, you can uncomment the WHERE clause below to only show addresses with a balance of at least 1 Locked CELO at the time of snapshot.
            -- The reason we can't use this in practice is because Dune doesn't account for accrued yield which means the Dune balances will always be lower than the actual balances.
            -- WHERE
            -- COALESCE(TRY ((locked.total - unlocked.total) / 1e18), 0) >= CAST(1 as DOUBLE)
        ORDER BY
            balance DESC
    )
SELECT
    '<a href=https://celoscan.io/address/' || cast(l.address as varchar) || ' target=_blank>' || cast(l.address as varchar) || '</a>' as Address,
    l.balance as "Locked CELO",
    l.balance * p.price as "Locked CELO in USD",
    CASE
    -- If there's a contract creation TX hash for this address, it means it should be contract (and not an EOA)
        WHEN COUNT(t.tx_hash) > 0 THEN (
            CASE
            -- If the address is on the safe_celo.safes Dune table, label it as 'Gnosis Safe'
                WHEN COUNT(gnosis_safe.tx_hash) > 0 THEN 'Gnosis Safe'
                -- else if Dune has a contract name (available for many verified contracts), use the contract name.
                -- (annoyingly, some contracts have more than 1 name which is why this complicated merging of contract names into 1 column is required)
                WHEN COUNT(contract.name) > 0 THEN array_join (array_agg (contract.name), ', ')
                -- else tag it as 'unverified'
                ELSE 'unverified'
            END
        )
        ELSE NULL
    END AS "Contract"
FROM
    locked_balances l
    LEFT JOIN celo.contracts "contract" ON contract.address = l.address
    LEFT JOIN celo.creation_traces t ON t.address = l.address
    LEFT JOIN safe_celo.safes "gnosis_safe" ON gnosis_safe.address = l.address
    LEFT JOIN celo_usd_price p ON p.time = date_trunc ('minute', TIMESTAMP '{{snapshot time}}')
GROUP BY
    l.address,
    l.balance,
    p.price
ORDER BY
    balance DESC