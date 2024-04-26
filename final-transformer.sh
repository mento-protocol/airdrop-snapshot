#! /bin/bash
# Removes all columns except for address and total allocation
cut -d, -f1,5 final-snapshots/airdrop-amounts-per-address.csv >buffer.csv

# Sorts by allocation descending
sort -t, -k2,2 -rn buffer.csv -o buffer.csv

# Multiplies the 2nd column by 1e18 to convert to wei
awk -F',' '{ $2 *= 1e18; print }' buffer.csv >buffer-wei.csv

# Cuts header (which is the last line after the sort operation)
sed '$d' buffer-wei.csv >final-snapshots/final-allocations-in-wei.csv

# Removes the temp buffer files
rm buffer.csv buffer-wei.csv
