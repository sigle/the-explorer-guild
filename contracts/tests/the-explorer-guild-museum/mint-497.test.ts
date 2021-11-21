import { Clarinet, Tx, Chain, Account, assertEquals } from "../packages.ts";

Clarinet.test({
  name: "[mint-497] Should throw error if non contract owner try to mint",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "mint-497",
        [],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[mint-497] Should mint 497 to the deployer wallet",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    // TODO change to 497
    let numberToMint = 7;
    let wallet_deployer = accounts.get("deployer")!;

    // TODO mint 2503 before

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "mint-497",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    const events = block.receipts[0].events;

    // 1. Top up contract balance
    events[0].stx_transfer_event.sender.expectPrincipal(
      wallet_deployer.address
    );
    events[0].stx_transfer_event.recipient.expectPrincipal(
      `${wallet_deployer.address}.the-explorer-guild-museum`
    );
    events[0].stx_transfer_event.amount.expectInt(497);

    // 2. Mint 497 NFTs in the museum contract
    for (let index = 0; index < numberToMint; index++) {
      const baseIndex = index * 2;

      let { sender, recipient, amount } =
        events[baseIndex + 1].stx_transfer_event;
      sender.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild-museum`
      );
      recipient.expectPrincipal(wallet_deployer.address);
      amount.expectInt(1);

      let {
        asset_identifier,
        recipient: recipientMintEvent,
        value,
      } = events[baseIndex + 2].nft_mint_event;
      asset_identifier.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild::The-Explorer-Guild`
      );
      recipientMintEvent.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild-museum`
      );
      value.expectUint(index + 1);
    }

    // 3. Send all the NFTs to the owner wallet
    for (let index = 0; index < numberToMint; index++) {
      const baseIndex = index + numberToMint * 2;

      let { asset_identifier, sender, recipient, value } =
        events[baseIndex + 1].nft_transfer_event;
      asset_identifier.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild::The-Explorer-Guild`
      );
      sender.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild-museum`
      );
      recipient.expectPrincipal(wallet_deployer.address);
      value.expectUint(index + 1);
    }

    let assetMaps = chain.getAssetsMaps();

    assertEquals(
      assetMaps.assets[".the-explorer-guild.The-Explorer-Guild"][
        `${wallet_deployer.address}.the-explorer-guild-museum`
      ],
      0
    );
    assertEquals(
      assetMaps.assets[".the-explorer-guild.The-Explorer-Guild"][
        wallet_deployer.address
      ],
      7
    );
  },
});
