#! /bin/bash
# Removes all columns except for address and total allocation
cut -d, -f1,5 final-snapshots/airdrop-amounts-per-address.csv >buffer.csv

# Sorts by allocation descending
sort -t, -k2,2 -rn buffer.csv -o buffer.csv

# Cuts header (which is the last line after the sort operation)
sed '$d' buffer.csv >final-snapshots/final-allocation.csv

# Removes the temp buffer file
rm buffer.csv
