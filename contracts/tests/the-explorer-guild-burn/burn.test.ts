import { Clarinet, Tx, Chain, Account, assertEquals } from "../packages.ts";

Clarinet.test({
  name: "[burn] Should throw error if non contract owner try to burn",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall("the-explorer-guild-burn", "burn", [], wallet_1.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[burn] Should mint and transfer 500 NFTs to the museum contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-burn",
        "burn",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    let assetMaps = chain.getAssetsMaps();
    assertEquals(
      assetMaps.assets[".the-explorer-guild.The-Explorer-Guild"][
        `${wallet_deployer.address}.the-explorer-guild-burn`
      ],
      500
    );
  },
});

Clarinet.test({
  name: "[burn] Should burn only 10000 NFTs to the contract wallet while paying 500 STX per call",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    // call 1 times more then mints possible
    const index = [...new Array(21).keys()];

    let block = chain.mineBlock(
      index.map(() =>
        Tx.contractCall(
          "the-explorer-guild-burn",
          "burn",
          [],
          wallet_deployer.address
        )
      )
    );

    index.map((i) => block.receipts[i].result.expectOk().expectBool(true));
    index.map((i) => {
      let events = block.receipts[i].events;
      // 500 STXs are always transferred to the museum contract
      events.expectSTXTransferEvent(
        500,
        wallet_deployer.address,
        `${wallet_deployer.address}.the-explorer-guild-burn`
      );

      if (i < 20) {
        // at least 1 stx is transferred back per NFT (500 STX in total)
        events.expectSTXTransferEvent(
          1,
          `${wallet_deployer.address}.the-explorer-guild-burn`,
          wallet_deployer.address
        );
      } else {
        // no nfts are minted if count > 10000
        events.length.toString().expectInt(1);
      }
      return true;
    });
  },
});
