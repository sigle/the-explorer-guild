# wallet-snapshot

Create a snapshot of the wallet addresses owning a The Explorer Guild NFT.
It currently resolve marketplaces too so owners don't need to unlist their NFTs to be in the snapshot. Marketplaces currently supported are [StxNft](https://stxnft.com/) and [StacksArt](https://www.stacksart.com/).

## Usage

Run the following command to create a snapshot:

```bash
pnpm run run
```

This will create a `snapshot.csv` file containing the addresses.

## Run this script on another collection

To run this script for another collection just edit the values of the config in `./src/config.ts` and run `pnpm run run`.
