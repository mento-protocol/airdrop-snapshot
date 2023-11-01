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
    address as Address,
    balance as "Locked CELO"
FROM
    locked_balances
ORDER BY
    balance DESC