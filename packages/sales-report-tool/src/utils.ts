import { Transaction } from "@stacks/stacks-blockchain-api-types";

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
