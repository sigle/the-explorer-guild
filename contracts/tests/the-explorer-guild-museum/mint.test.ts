import { Clarinet, Tx, Chain, Account, assertEquals } from "../packages.ts";

Clarinet.test({
  name: "[mint] Should throw error if non contract owner try to mint",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "mint",
        [],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[mint] Should throw error if minting more than 493 NFTs",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;

    for (let index = 0; index < 7; index++) {
      let block = chain.mineBlock([
        Tx.contractCall(
          "the-explorer-guild-museum",
          "mint",
          [],
          wallet_deployer.address
        ),
      ]);

      block.receipts[0].result.expectOk().expectBool(true);
    }

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "mint",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(12);
  },
});

Clarinet.test({
  name: "[mint] Should mint 71 NFTs to the deployer wallet",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let numberToMint = 71;
    let wallet_deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "mint",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    let events = block.receipts[0].events;
    let assetMaps = chain.getAssetsMaps();

    // 1. Top up contract balance
    events[0].stx_transfer_event.sender.expectPrincipal(
      wallet_deployer.address
    );
    events[0].stx_transfer_event.recipient.expectPrincipal(
      `${wallet_deployer.address}.the-explorer-guild-museum`
    );
    events[0].stx_transfer_event.amount.expectInt(71);

    // 2. Mint 71 NFTs in the museum contract
    for (let index = 0; index < numberToMint; index++) {
      const baseIndex = index * 3;

      // 2.1. Check that 1 STX was sent
      let { sender, recipient, amount } =
        events[baseIndex + 1].stx_transfer_event;
      sender.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild-museum`
      );
      recipient.expectPrincipal(wallet_deployer.address);
      amount.expectInt(1);

      // 2.2. Check that 1 NFT was minted into the museum contract wallet
      // because contract owner can mint because mint fees can't be transferred.
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

      // 2.3. Check that the NFT was transferred from the museum contract wallet to the owner wallet
      ({ asset_identifier, sender, recipient, value } =
        events[baseIndex + 3].nft_transfer_event);
      asset_identifier.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild::The-Explorer-Guild`
      );
      sender.expectPrincipal(
        `${wallet_deployer.address}.the-explorer-guild-museum`
      );
      recipient.expectPrincipal(wallet_deployer.address);
      value.expectUint(index + 1);
    }

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
      71
    );
  },
});
