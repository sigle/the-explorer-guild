# sales-report-tool

This is a small package that can be used to export
your NFT project sales data to CSV file.

## How to use the tool?

1. Go to `index.js` line 17 and change address to your minting contract address
2. Go to `index.js` line 19 and change mint price to your project mint price
2. Go to `index.js` line 60 to check whether you need to add any custom logic for folks wwho minted from CLI
3. Run `npm install` and `npm run` 
4. After completing these steps you will gave `data.csv` in your folder

## What rows does the CSV contain

- Number of the purchase 
- Time
- Transaction ID
- Address of the buyer
- Amount of STX spent
- Amount of NFTs bought
- Total amount of NFTs sold up to this point
