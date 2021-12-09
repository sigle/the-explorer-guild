/**
 * Running this script will generate a snapshot of all the addresses owning
 * a The Explorer Guild NFT.
 */
import { writeFileSync } from "fs";
import { uintCV, cvToJSON } from "@stacks/transactions";
import {
  callReadOnlyFunctionRetry,
  resolveStacksArtOwner,
  resolveStxNftOwner,
} from "./utils";
import { config } from "./config";

function sliceIntoChunks(arr: any[], chunkSize: number): number[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

const run = async () => {
  const collectionSize = 2503;
  const chunkSize = 15;
  console.log(`Taking a snapshot of the ${collectionSize} NFTs...`);

  const stats = { uniqueAddresses: 0, stxNft: 0, stacksArt: 0 };
  const addresses: string[] = [];
  const arrayHelper = [...Array(collectionSize).keys()];
  const arrayHelperChunks = sliceIntoChunks(arrayHelper, chunkSize);

  // 1. Get all the addresses that own the NFT
  // Use chunks to make multiple calls at the same time
  for (const [index, chunk] of arrayHelperChunks.entries()) {
    console.log(
      `processing chunk ${index} (${index * chunkSize}), ${
        arrayHelper.length - index * chunkSize
      } NFTs left`
    );

    const newAddresses = await Promise.all(
      chunk.map(async (value) => {
        const nftIndex = value + 1;
        const response = await callReadOnlyFunctionRetry(
          {
            contractAddress: config.contractAddress,
            contractName: config.contractName,
            functionName: "get-owner",
            functionArgs: [uintCV(nftIndex)],
            senderAddress: "SP2KNQG5ZA7Z5TJ50CSQQM50RWZEB6MAZZE9YDZFS",
          },
          1000,
          10
        );
        const data = cvToJSON(response);
        let address: string = data.value.value.value;

        // Get the real addresses for the items which are listed on marketplaces
        if (
          address === "SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.marketplace-v4"
        ) {
          address = await resolveStxNftOwner(nftIndex);
          stats.stxNft += 1;
        } else if (
          address ===
          "SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.stacks-art-market-v2"
        ) {
          address = await resolveStacksArtOwner(nftIndex);
          stats.stacksArt += 1;
        }
        return address;
      })
    );

    newAddresses.forEach((address) => {
      addresses.push(address);
    });
  }

  // 2. Remove duplicates
  const uniqueAddresses: { [key: string]: { value: number } } = {};
  addresses.forEach((address) => {
    if (!uniqueAddresses[address]) {
      uniqueAddresses[address] = { value: 1 };
    } else {
      uniqueAddresses[address].value++;
    }
  });
  stats.uniqueAddresses = Object.keys(uniqueAddresses).length;

  console.log(`Unique addresses found: ${stats.uniqueAddresses}`);
  console.log(`NFTs listed on StacksArt: ${stats.stacksArt}`);
  console.log(`NFTs listed on StxNft: ${stats.stxNft}`);

  // 3. Create snapshot file
  writeFileSync(
    "./snapshot.csv",
    `Address,NbNFTs
${Object.keys(uniqueAddresses)
  .map((address) => `${address},${uniqueAddresses[address].value}`)
  .join("\n")}
`,
    { encoding: "utf8" }
  );

  console.log("Created file snapshot.txt");
};

run();
