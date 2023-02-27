# sales-report-tool

Create a secondary sales report for a collection. The result is stored as a CSV file.

## Usage

Run the following command to generate a secondary sales report:

```bash
pnpm run run-secondary <start-date> <end-date>
# Eg: pnpm run run-secondary 2021-01-01 2021-01-31
```

This will create a `secondary-sales.csv` file containing the data.

## Run this script on another collection

To run this script for another collection just edit the values of the config in `./src/config.ts` and run `pnpm run run`.
