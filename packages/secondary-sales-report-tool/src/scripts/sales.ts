import { AccountsApi, TransactionsApi } from "@stacks/blockchain-api-client";
import type {
  Transaction,
  TransactionEventStxAsset,
} from "@stacks/stacks-blockchain-api-types";
import { addDays, format, isAfter, isBefore } from "date-fns";
import { config } from "../config";
import { writeFileSync } from "fs";
import { isSaleTransaction, microToStacks } from "../utils";
import { getSTXPrice } from "../coingecko";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const run = async () => {
  const accountsApi = new AccountsApi();
  const transactionsApi = new TransactionsApi();

  const startDate = new Date("2023-02-20");
  const endDate = new Date("2023-02-26");

  const results: {
    date: string;
    txId: string;
    amountSTX: number;
    amountEUR: number;
    STXprice: number;
  }[] = [];
  const transactions: Transaction[] = [];

  /**
   * Get the full list of transactions for the sale address.
   * Based on the startDate and endDate, we can filter the transactions.
   */
  let offset = 0;
  const limit = 50;
  while (true) {
    const transactionsResults = await accountsApi.getAccountTransactions({
      principal: config.secondarySalesAddress,
      limit,
      offset,
    });
    // If we get less transactions than the limit, we reached the end.
    if (transactionsResults.results.length < limit) {
      break;
    }
    for (const transaction of transactionsResults.results as Transaction[]) {
      const transactionDate = new Date(transaction.burn_block_time * 1000);
      const isWithinDateRange =
        isAfter(transactionDate, startDate) &&
        // We add one day to the endDate to include the last day.
        isBefore(transactionDate, addDays(endDate, 1));
      console.log(startDate, transactionDate, endDate, isWithinDateRange);
      if (isWithinDateRange) {
        transactions.push(transaction);
      }
    }
    // If one of the transaction is before the startDate, we can stop.
    if (
      (transactionsResults.results as Transaction[]).some((transaction) =>
        isBefore(new Date(transaction.burn_block_time * 1000), startDate)
      )
    ) {
      break;
    }
    offset += limit;
  }

  console.log(`Starting to process ${transactions.length} transactions`);

  let index = 0;
  for (const transaction of transactions) {
    const date = format(transaction.burn_block_time * 1000, "dd-MM-yyyy");
    console.log(`#${index} - ${date}: processing tx ${transaction.tx_id}`);

    const detailedTransaction = (await transactionsApi.getTransactionById({
      txId: transaction.tx_id,
    })) as Transaction;

    // We only report smart contracts calls of sales events.
    if (isSaleTransaction(detailedTransaction)) {
      const eventSTX = detailedTransaction.events.find(
        (event) =>
          event.event_type === "stx_asset" &&
          event.asset.recipient === config.secondarySalesAddress
      ) as TransactionEventStxAsset;
      const royaltyAmountInSTX = microToStacks(eventSTX.asset.amount!);

      const STXprice = await getSTXPrice(date);

      const STXpriceRounded = Math.floor(STXprice * 100) / 100;
      const EURpriceRounded =
        Math.floor(STXprice * royaltyAmountInSTX * 100) / 100;

      results.push({
        date,
        txId: detailedTransaction.tx_id,
        amountSTX: royaltyAmountInSTX,
        amountEUR: EURpriceRounded,
        STXprice: STXpriceRounded,
      });
    } else {
      console.log(
        `Skipping ${detailedTransaction.tx_id} - ${detailedTransaction.tx_type}`
      );
    }

    /**
     * To avoid hitting the coingecko API rate limit,
     * we sleep between transactions.
     */
    await sleep(500);
    index++;
  }

  if (results.length > 0) {
    writeFileSync(
      `./${config.salesFilename}`,
      `Date,Transaction id,STX received, STX received in EUR,1 STX in EUR
${results
  .map(
    (txn) =>
      `${txn.date},${txn.txId},${txn.amountSTX},${txn.amountEUR},${txn.STXprice}`
  )
  .join("\n")}
    `,
      { encoding: "utf8" }
    );

    console.log(`Created file ${config.salesFilename}:`);
    console.log(`- ${results.length} transactions`);
    console.log(`- Total STX: ${results.reduce((a, b) => a + b.amountSTX, 0)}`);
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
