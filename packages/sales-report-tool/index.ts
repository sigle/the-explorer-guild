import { getFormattedDate, getAmountOfNFTs } from "./utils";
import { writeFileSync } from "fs";
import { fetch } from "undici";

interface Transaction {
  number: number;
  time: string;
  txnId: string;
  address: string;
  amountOfSTX: number;
  amountOfNFTsBought: number;
  totalAmountOfNFTsSold: number;
}

// Array for storing transactions
const arrOfTxn: Transaction[] = [];
let total: number;
// Minting wallet address
const address = `SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173`;
// Mint price
const mintPrice = 100;

const getAccounting = async () => {
  await fetch(
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/transactions`
  )
    .then((response: any) => response.json())
    .then((data: any) => {
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
      .then((response: any) => response.json())
      .then((data: any) => {
        data?.results?.forEach((txn: any) => {
          if (
            txn.sender_address !== address &&
            txn.tx_type === "contract_call"
          ) {
            nftsSold =
              nftsSold + getAmountOfNFTs(txn.contract_call.function_name);
            arrOfTxn.push({
              number: index,
              time: getFormattedDate(txn.burn_block_time),
              txnId: txn.tx_id,
              address: txn.sender_address,
              amountOfSTX:
                getAmountOfNFTs(txn.contract_call.function_name) * mintPrice,
              amountOfNFTsBought: getAmountOfNFTs(
                txn.contract_call.function_name
              ),
              totalAmountOfNFTsSold: nftsSold,
            });
            index = index + 1;
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
    writeFileSync(
      "./data.csv",
      `number,time,txnId, address, amountOfSTX, amountOfNFTsBought, totalAmountOfNFTsSold
    ${arrOfTxn
      .map(
        (txn) =>
          `${txn.number},${txn.time},${txn.txnId},${txn.address},${txn.amountOfSTX},${txn.amountOfNFTsBought},${txn.totalAmountOfNFTsSold}`
      )
      .join("\n")}
    `,
      { encoding: "utf8" }
    );

    console.log("Created file data.csv");
  }
};

getAccounting();
