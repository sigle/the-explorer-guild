// Data formating
export const getFormattedDate = (date: number) => {
  const theDate = new Date(date * 1000);
  const dateString = theDate.toUTCString();
  return dateString;
};

// Fn name formating
export const getAmountOfNFTs = (functionName: string) => {
  if (functionName === "claim") {
    return 1;
  } else if (functionName === "claim-two") {
    return 2;
  } else if (functionName === "claim-three") {
    return 3;
  } else if (functionName === "claim-four") {
    return 4;
  } else if (functionName === "claim-five") {
    return 5;
  } else if (functionName === "claim-six") {
    return 6;
  } else if (functionName === "claim-seven") {
    return 7;
  } else if (functionName === "claim-eight") {
    return 8;
  } else if (functionName === "claim-nine") {
    return 9;
  } else {
    return 10;
  }
};

export interface TransactionFromAPI {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  // TO DO IMPROVE THIS TYPE
  post_conditions: any[];
  anchor_mode: string;
  is_unanchored: boolean;
  block_hash: string;
  parent_block_hash: string;
  block_height: number;
  burn_block_time: number;
  burn_block_time_iso: string;
  parent_burn_block_time: number;
  parent_burn_block_time_iso: string;
  canonical: boolean;
  tx_index: number;
  tx_status: string;
  tx_result: any[];
  microblock_hash: string;
  microblock_sequence: number;
  microblock_canonical: boolean;
  event_count: number;
  events: any[];
  execution_cost_read_count: number;
  execution_cost_read_length: number;
  execution_cost_runtime: number;
  execution_cost_write_count: number;
  execution_cost_write_length: number;
  tx_type: string;
  // TODO IMPROVE THIS TYPE
  contract_call: any[];
}

export interface ResponseFromTransactionRequest {
  limit: number;
  offset: number;
  total: number;
  results: TransactionFromAPI[];
}
