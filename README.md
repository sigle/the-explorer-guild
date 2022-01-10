<div align="center">

<img width="160" height="105" src="assets/the-explorer-guild-logo.svg">

<h1>The Explorer Guild</h1>

</div>

10 000 NFT unique and randomly generated NFTs on the Stacks blockchain. Hand drawn and inspired by the famous writer [Jules Verne](https://en.wikipedia.org/wiki/Jules_Verne). To learn more about the project you can check out the website https://www.explorerguild.io or [join our discord](https://discord.gg/X2Dbz3xbrs).

This mono-repository contains the Stacks Smart Contracts written in Clarity, as well as the server code used to serve the metadata. You can find more information in the sub folders readme.

## Important information

- Contract address: [SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173](https://explorer.stacks.co/address/SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173?chain=mainnet)
- Provenance hash: [2f2df159abd91a57b342593537af944d8480039467ef8c31fe5871625c3b8e13](https://explorer.stacks.co/txid/0xd4a3a4cb16f4cbe2e2b00862bc7dc7244903787f9a91e49d09e1ff520a1f987e?chain=mainnet)

## Release

- premint - November 1st
- public sale and reveal - November 3nd

## Providing a fair launch

### Approach

To explain the solution we came up with, let's first have a look at the problems we are trying to solve. NFTs have various attributes providing them with some rarity, pieces having high rarity are usually sold for a higher price on the secondary market. Releasing the metadata of the full collection before the items are sold would allow people to specifically target the rarest pieces they want to mint.

### Provenance hash

To hide the metadata and prove that we didn't change it post-launch we decided to use the NFT provenance hash solution. Before uploading the contracts, we will generate a provenance hash and add it as a constant of our contracts.
_You can read more about the provenance hash approach [here](https://medium.com/coinmonks/the-elegance-of-the-nft-provenance-hash-solution-823b39f99473)_.

The starting number for the collection will be a random number between 1 and 10 000. This number will be generated on-chain and using the VRF function so developers can't manipulate it. It will be revealed when the public sale is starting.

### Fair distribution

During the mint period, to hide the metadata, we will be using a centralised server to return it. When asking the metadata of a specific id to our server, the server will check if the id was already minted, if yes, the metadata will be returned, if no then a placeholder metadata will be returned. This will prevent users to enumerate all the ids before they are minted.
_Code of the server will be open-sourced soon._

### Meta data stored on Arweave

After the sale is over, and all the NFTs are minted, we will upload all the metadata to [Arweave](https://www.arweave.org/), call the `set-base-token-uri` with the Arweave transaction id in this format: `ar://<arweave-id>`. After checking that everything is working properly, we will call the `freeze-metadata` function which will lock the metadata base url and prove that it can't be changed anymore. This means no more centralised server anymore. And to check that the metadata was not changed in between, you will be able to use the provenance hash provided before.

## Burned explorers

- Vote contract: [SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild-vote](https://explorer.stacks.co/txid/SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild-vote?chain=mainnet)

[An on-chain vote](https://app.sigle.io/sigleapp.id.blockstack/OSb5KPH8g1Ms-6vU7x1fe) to decide the destiny of the remaining explorers happened and resulted in the decision of [burning 7000 pieces](https://app.sigle.io/sigleapp.id.blockstack/BrdkUDZCvbbFoFHGx1DNu).

The 7000 explorers will be owned by the museum contract and can't be transferred to anyone.
