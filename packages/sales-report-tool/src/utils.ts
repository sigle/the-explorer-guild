import { AccountsApi } from "@stacks/blockchain-api-client";
import { Transaction } from "@stacks/stacks-blockchain-api-types";
import { addDays, isAfter, isBefore } from "date-fns";

/**
 * @description Convert micro to stacks.
 * @param amountInMicroStacks - the amount of microStacks to convert
 */
export const microToStacks = (amountInMicroStacks: string | number) =>
  Number(amountInMicroStacks) / Math.pow(10, 6);

/**
 * @description Check if the transaction is a sale.
 * @param transaction - the transaction to check
 */
export const isSaleTransaction = (transaction: Transaction) => {
  return (
    // Gamma
    (transaction.tx_type === "contract_call" &&
      transaction.contract_call.contract_id ===
        "SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.marketplace-v4" &&
      transaction.contract_call.function_name === "purchase-asset") ||
    // Tradeport v5
    (transaction.tx_type === "contract_call" &&
      transaction.contract_call.contract_id ===
        "SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.byzantion-market-v5" &&
      transaction.contract_call.function_name === "buy-item") ||
    // Tradeport v6
    (transaction.tx_type === "contract_call" &&
      transaction.contract_call.contract_id ===
        "SP1BX0P4MZ5A3A5JCH0E10YNS170QFR2VQ6TT4NRH.byzantion-market-v6" &&
      transaction.contract_call.function_name === "buy-item") ||
    // Tradeport v7
    (transaction.tx_type === "contract_call" &&
      transaction.contract_call.contract_id ===
        "SP1BX0P4MZ5A3A5JCH0E10YNS170QFR2VQ6TT4NRH.byzantion-market-v7" &&
      transaction.contract_call.function_name === "buy-item") ||
    // StacksArt
    (transaction.tx_type === "contract_call" &&
      transaction.contract_call.contract_id ===
        "SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.stacks-art-market-v2" &&
      transaction.contract_call.function_name === "buy-item")
  );
};

/**
 * @description Get the full list of transactions for the sale address.
 * Based on the startDate and endDate, we can filter the transactions.
 */
export const getTransactions = async ({
  accountsApi,
  startDate,
  endDate,
  principal,
}: {
  accountsApi: AccountsApi;
  startDate: Date;
  endDate: Date;
  principal: string;
}) => {
  const transactions: Transaction[] = [];

  let offset = 0;
  const limit = 50;
  while (true) {
    const transactionsResults = await accountsApi.getAccountTransactions({
      principal,
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

  return transactions;
};
