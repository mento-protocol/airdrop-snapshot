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