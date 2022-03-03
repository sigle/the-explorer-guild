const fastcsv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("data.csv");
const fetch = require("cross-fetch");

// Data formating
const getFormattedDate = (date) => {
  const theDate = new Date(date * 1000);
  const dateString = theDate.toGMTString();
  return dateString;
};

// Array for storing transactions
const arrOfTxn = [];
let total;
// Minting wallet address
const address = `SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173`;
// Mint price
const mintPrice = 100;

const getAccounting = async () => {
  await fetch(
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/transactions`
  )
    .then((response) => response.json())
    .then((data) => {
      total = data.total;
    });
  let indexOfLastTxn = total;
  let index = 1;
  let nftsSold = 0;

  while (indexOfLastTxn > 0 && indexOfLastTxn <= total) {
    await fetch(
      `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/transactions?offset=${
        indexOfLastTxn - 20
      }`
    )
      .then((response) => response.json())
      .then((data) => {
        data?.results?.map((txn) => {
            if (
              txn.sender_address !== address &&
              txn.tx_type === "contract_call" &&
              txn.post_conditions[0]
            ) {
              nftsSold =
                nftsSold + txn.post_conditions[0].amount / 1000000 / mintPrice;
              arrOfTxn.push({
                number: index,
                time: getFormattedDate(txn.burn_block_time),
                txnId: txn.tx_id,
                address: txn.sender_address,
                amountOfSTX: txn.post_conditions[0].amount / 1000000,
                amountOfNFTsBought:
                  txn.post_conditions[0].amount / 1000000 / mintPrice,
                totalAmountOfNFTsSold: nftsSold,
              });
              index = index + 1;
            // NB! This part is to handle cases where smart contracts 
            // were called from CLI and therefore if you end up
            // using this part make sure to tailor it to your needs
            } else if (
              txn.sender_address !== address &&
              txn.tx_type === "contract_call" &&
              !txn.post_conditions[0]
            ) {
              arrOfTxn.push({
                number: index,
                time: getFormattedDate(txn.burn_block_time),
                txnId: txn.tx_id,
                address: txn.sender_address,
                amountOfSTX:
                  txn.contract_call.function_name === "claim-four"
                    ? 400
                    : txn.contract_call.function_name === "claim-two" && 200,
                amountOfNFTsBought:
                  txn.contract_call.function_name === "claim-four" ? 4 : 2,
                totalAmountOfNFTsSold: nftsSold,
              });
              index = index + 1;
              nftsSold =
                nftsSold +
                (txn.contract_call.function_name === "claim-four" ? 4 : 2);
            }
          });
      });
    if (indexOfLastTxn < 20) {
      indexOfLastTxn = 20;
    } else {
      indexOfLastTxn = indexOfLastTxn - 20;
    }
  }
  if (arrOfTxn.length > 0) {
    console.log("About to insert ", arrOfTxn.length);
    fastcsv
      .write(arrOfTxn, { headers: true })
      .on("finish", function () {
        console.log("Write to CSV successfully!");
      })
      .pipe(ws);
  }
};

getAccounting();
