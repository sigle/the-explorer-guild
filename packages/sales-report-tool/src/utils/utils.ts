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
