/**
 * Running this script will generate a snapshot of all the addresses owning
 * a The Explorer Guild NFT.
 */
import { writeFileSync } from "fs";
import { uintCV, callReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import { request } from "undici";

function sliceIntoChunks(arr: any[], chunkSize: number): string[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

const run = async () => {
  const collectionSize = 2503;
  const chunkSize = 10;
  console.log(`Taking a snapshot of the ${collectionSize} NFTs...`);

  const addresses: string[] = [];
  const arrayHelper = [...Array(collectionSize).keys()];
  // const arrayHelper = [...Array(3).keys()];

  // 1. Get all the addresses that own the NFT
  // Use chunks to make multiple calls at the same time
  const arrayHelperChunks = sliceIntoChunks(arrayHelper, chunkSize);
  for (const [index, chunk] of arrayHelperChunks.entries()) {
    console.log(
      `processing chunk ${index} (${index * chunkSize}), ${
        arrayHelper.length - index * chunkSize
      } NFTs left`
    );

    const newAddresses = await Promise.all(
      chunk.map(async (value) => {
        const nftIndex = value + 1;
        const response = await callReadOnlyFunction({
          contractAddress: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
          contractName: "the-explorer-guild",
          functionName: "get-owner",
          senderAddress: "SP2KNQG5ZA7Z5TJ50CSQQM50RWZEB6MAZZE9YDZFS",
          functionArgs: [uintCV(nftIndex)],
        });
        const data = cvToJSON(response);
        const address = data.value.value.value;
        return address;
      })
    );

    newAddresses.forEach((address) => {
      addresses.push(address);
    });
  }

  // 2. Get the real addresses for the items which are listed on marketplaces
  for (const [index, address] of addresses.entries()) {
    const nftNumber = index + 1;
    if (address === "SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.marketplace-v4") {
      const { statusCode, body } = await request(
        `https://stxnft.com/api/marketplace?owner=SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild:${nftNumber}`
      );
      if (statusCode !== 200) {
        throw new Error(`Failed to get marketplace data for ${nftNumber}`);
      }
      let data = await body.json();
      data = data[0];
      if (!data) {
        throw new Error(
          `Failed to get marketplace data for ${nftNumber}, empty array`
        );
      }
      const owner = data.listing.owner;
      addresses[index] = owner;
    }

    // TODO Stacks Art
  }

  // 3. Remove duplicates
  const uniqueAddresses: { [key: string]: { value: number } } = {};
  addresses.forEach((address) => {
    if (!uniqueAddresses[address]) {
      uniqueAddresses[address] = { value: 1 };
    } else {
      uniqueAddresses[address].value++;
    }
  });

  console.log(`Unique addresses found: ${Object.keys(uniqueAddresses).length}`);

  // 4. Create snapshot file
  writeFileSync(
    "./snapshot.txt",
    `
${Object.keys(uniqueAddresses)
  .map(
    (address) =>
      `(map-set vote-count '${address} u${uniqueAddresses[address].value})`
  )
  .join("\n")}
`,
    { encoding: "utf8" }
  );

  console.log("Created file snapshot.txt");
};

run();
