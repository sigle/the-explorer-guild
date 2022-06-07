import {
  AccountsApi,
  Configuration,
  TransactionsApi,
} from "@stacks/blockchain-api-client";
import type { Transaction } from "@stacks/stacks-blockchain-api-types";
import { fetch } from "undici";
import { format } from "date-fns";
import { config } from "./config";
import { writeFileSync } from "fs";
import { microToStacks } from "./utils";
import { getSTXPrice } from "./coingecko";

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
    nftId: number;
    amountSTX: number;
    STXprice: number;
  }[] = [];

  // TODO figure out blocks for the month

  const transactions = await accountsApi.getAccountTransactions({
    principal: config.secondarySalesAddress,
  });
  for (const tx of transactions.results) {
    // Used to infer the correct type
    const transaction = tx as Transaction;
    const date = format(transaction.burn_block_time * 1000, "dd-MM-yyyy");
    console.log(`${date}: processing tx ${transaction.tx_id}`);

    const detailedTransaction = (await transactionsApi.getTransactionById({
      txId: transaction.tx_id,
    })) as Transaction;

    // We only report smart contracts calls
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
        const STXprice = await getSTXPrice(date);
        // Round to 2 decimals
        const STXpriceRounded = Math.floor(STXprice * 100) / 100;

        results.push({
          date,
          txId: detailedTransaction.tx_id,
          nftId:
            nftSaleEvent.event_type === "non_fungible_token_asset"
              ? Number(nftSaleEvent.asset.value.repr.replace("u", ""))
              : 0,
          amountSTX:
            secondarySaleEvent.event_type === "stx_asset"
              ? microToStacks(Number(secondarySaleEvent.asset.amount))
              : 0,
          STXprice: STXpriceRounded,
        });
      }
    }

    // console.log(JSON.stringify(transaction, null, 2));
    // console.log(JSON.stringify(detailedTransaction, null, 2));

    /**
     * To avoid hitting the coingecko API rate limit,
     * we sleep between transactions.
     */
    await sleep(1000);
  }

  if (results.length > 0) {
    console.log(`About to insert ${results.length} rows`);
    writeFileSync(
      `./${config.filename}`,
      `Date,Transaction id,NFT id,STX received, STX price in EUR
    ${results
      .map(
        (txn) =>
          `${txn.date},${txn.txId},${txn.nftId},${txn.amountSTX},${txn.STXprice}`
      )
      .join("\n")}
    `,
      { encoding: "utf8" }
    );

    console.log(`Created file ${config.filename}`);
  }
};

run();
