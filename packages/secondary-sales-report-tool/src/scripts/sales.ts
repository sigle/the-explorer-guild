import {
  AccountsApi,
  Configuration,
  TransactionsApi,
} from "@stacks/blockchain-api-client";
import type { Transaction } from "@stacks/stacks-blockchain-api-types";
import { fetch } from "undici";
import { format } from "date-fns";
import { config } from "../config";
import { writeFileSync } from "fs";
import { microToStacks } from "../utils";
import { getSTXPrice } from "../coingecko";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const run = async () => {
  const configuration = new Configuration({ fetchApi: fetch });
  const accountsApi = new AccountsApi(configuration);
  const transactionsApi = new TransactionsApi(configuration);

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
   */
  let offset = 0;
  const limit = 50;
  while (true) {
    const transactionsResults = await accountsApi.getAccountTransactions({
      principal: config.salesAddress,
      limit,
      offset,
    });
    if (transactionsResults.results.length < limit) {
      break;
    }
    transactions.push(...(transactionsResults.results as Transaction[]));
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

    // We only report smart contracts calls of mint events.
    if (
      detailedTransaction.tx_type === "contract_call" &&
      detailedTransaction.contract_call.contract_id ===
        "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild-mint" &&
      detailedTransaction.contract_call.function_name.startsWith("claim")
    ) {
      const amountSTX = detailedTransaction.events
        .filter(
          (event) =>
            event.event_type === "stx_asset" &&
            event.asset.asset_event_type === "transfer" &&
            event.asset.recipient === config.salesAddress
        )
        .reduce(
          (acc, event) =>
            acc +
            (event.event_type === "stx_asset"
              ? microToStacks(Number(event.asset.amount))
              : 0),
          0
        );

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
    }

    // console.log(JSON.stringify(transaction, null, 2));
    // console.log(JSON.stringify(detailedTransaction, null, 2));

    /**
     * To avoid hitting the coingecko API rate limit,
     * we sleep between transactions.
     */
    await sleep(500);
    index++;
  }

  if (results.length > 0) {
    console.log(`About to insert ${results.length} rows`);
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

    console.log(`Created file ${config.salesFilename}`);
  }
};

run();
