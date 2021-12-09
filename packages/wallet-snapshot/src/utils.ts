import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  contractPrincipalCV,
} from "@stacks/transactions";
import { config } from "./config";

function wait(delay: number) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function callReadOnlyFunctionRetry(
  options: {
    contractAddress: string;
    contractName: string;
    functionName: string;
    functionArgs: any[];
    senderAddress: string;
  },
  delay: number,
  tries: number
): any {
  function onError(err: Error) {
    const triesLeft = tries - 1;
    if (!triesLeft) {
      console.log(`Out of retries, failing`);
      throw err;
    }
    console.log(
      `Waiting ${delay}, ${triesLeft} tries left for function ${options.functionName}`
    );
    return wait(delay).then(() =>
      callReadOnlyFunctionRetry(options, delay, triesLeft)
    );
  }
  return callReadOnlyFunction(options).catch(onError);
}

export const resolveStxNftOwner = async (
  nftNumber: number
): Promise<string> => {
  const response = await callReadOnlyFunctionRetry(
    {
      contractAddress: "SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S",
      contractName: "marketplace-v4",
      functionName: "get-listing",
      functionArgs: [
        contractPrincipalCV(config.contractAddress, config.contractName),
        uintCV(nftNumber),
      ],
      senderAddress: "SP2KNQG5ZA7Z5TJ50CSQQM50RWZEB6MAZZE9YDZFS",
    },
    1000,
    10
  );
  const data = cvToJSON(response);
  const owner = data.value.value.owner.value;
  return owner;
};

export const resolveStacksArtOwner = async (
  nftNumber: number
): Promise<string> => {
  const response = await callReadOnlyFunctionRetry(
    {
      contractAddress: "SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG",
      contractName: "stacks-art-market-v2",
      functionName: "get-item-for-sale",
      functionArgs: [uintCV(config.stacksArtCollectionId), uintCV(nftNumber)],
      senderAddress: "SP2KNQG5ZA7Z5TJ50CSQQM50RWZEB6MAZZE9YDZFS",
    },
    1000,
    10
  );
  const data = cvToJSON(response);
  const owner = data.value.seller.value.value;
  return owner;
};
