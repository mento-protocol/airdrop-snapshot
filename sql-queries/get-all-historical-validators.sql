-- Fetch all addresses that have ever validated a celo block in order to filter
-- them out from the cStable balances query.
SELECT
  miner as validator
FROM
  celo.blocks
GROUP BY
  miner