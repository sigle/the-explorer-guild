import { StacksMainnet } from "@stacks/network";

export const config = {
  contractAddress: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
  contractName: "the-explorer-guild",
  collectionSize: 3000,
  stacksArtCollectionId: 16,
  network: new StacksMainnet(),
  // You can use your own node easily by changing the following line
  // network: new StacksMainnet({ url: "http://<my-server-ip>:3999" }),
};
