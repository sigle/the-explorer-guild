# The Explorer Guild

10 000 NFT unique and randomly generated NFTs on the Stacks blockchain. Hand drawn and inspired by the famous writer [Jules Verne](https://en.wikipedia.org/wiki/Jules_Verne). To learn more about the project you can check out the website https://www.explorerguild.io or [join our discord](https://discord.gg/X2Dbz3xbrs).

This mono-repository contains the Stacks Smart Contracts written in Clarity, as well as the server code used to serve the metadata. You can find more information in the sub folders readme.

## How the release will work

The release will be done in 2 steps:

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
