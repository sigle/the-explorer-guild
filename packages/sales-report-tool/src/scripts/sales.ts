import { AccountsApi, TransactionsApi } from "@stacks/blockchain-api-client";
import type { Transaction } from "@stacks/stacks-blockchain-api-types";
import { format } from "date-fns";
import { config } from "../config";
import { writeFileSync } from "fs";
import { getTransactions, microToStacks } from "../utils";
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

  const transactions = await getTransactions({
    accountsApi,
    startDate,
    endDate,
    principal: config.secondarySalesAddress,
  });

  console.log(`Starting to process ${transactions.length} transactions`);

  let index = 0;
  for (const transaction of transactions) {
    const date = format(transaction.burn_block_time * 1000, "dd-MM-yyyy");
    console.log(`#${index} - ${date}: processing tx ${transaction.tx_id}`);

    const detailedTransaction = (await transactionsApi.getTransactionById({
      txId: transaction.tx_id,
    })) as Transaction;

    // We only report smart contracts calls of sales events.
    if (detailedTransaction.tx_type === "contract_call") {
      const secondarySaleEvent = detailedTransaction.events.find(
        (event) =>
          event.event_type === "stx_asset" &&
          event.asset.asset_event_type === "transfer" &&
          event.asset.recipient === config.secondarySalesAddress
      );
      const nftSaleEvent = detailedTransaction.events.find(
        (event) =>
          event.event_type === "non_fungible_token_asset" &&
          event.asset.asset_event_type === "transfer" &&
          event.asset.asset_id === config.nftName
      );
      if (secondarySaleEvent && nftSaleEvent) {
        const amountSTX =
          secondarySaleEvent.event_type === "stx_asset"
            ? microToStacks(Number(secondarySaleEvent.asset.amount))
            : 0;
        const STXprice = await getSTXPrice(date);

        // Round to 2 decimals
        const STXpriceRounded = Math.floor(STXprice * 100) / 100;
        const EURpriceRounded = Math.floor(STXprice * amountSTX * 100) / 100;

        results.push({
          date,
          txId: detailedTransaction.tx_id,
          amountSTX,
          amountEUR: EURpriceRounded,
          STXprice: STXpriceRounded,
        });
      } else {
        console.log(
          `Skipping ${detailedTransaction.tx_id} - ${detailedTransaction.tx_type}`
        );
      }
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
