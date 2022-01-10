import { Clarinet, Tx, Chain, Account, assertEquals } from "../packages.ts";

Clarinet.test({
  name: "[burn] Should throw error if non contract owner try to burn",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "burn",
        [],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[burn] Should mint 350 NFTs to the contract wallet",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-museum",
        "burn",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);

    let assetMaps = chain.getAssetsMaps();
    assertEquals(
      assetMaps.assets[".the-explorer-guild.The-Explorer-Guild"][
        `${wallet_deployer.address}.the-explorer-guild-museum`
      ],
      350
    );
  },
});
