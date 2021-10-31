import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";
import { assertEquals } from "../packages.ts";

Clarinet.test({
  name: "[set-base-token-uri] Should throw error if non contract owner try to update the base token uri",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "set-base-token-uri",
        [types.ascii("ar://arweave-id")],
        wallet_1.address
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[set-base-token-uri] Should throw error if metadata is frozen",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "freeze-metadata",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "set-base-token-uri",
        [types.ascii("ar://arweave-id")],
        wallet_deployer.address
      ),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(13);
  },
});

Clarinet.test({
  name: "[set-base-token-uri] Contract owner can update the base token uri properly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "get-token-uri",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "set-base-token-uri",
        [types.ascii("ar://arweave-id/")],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "get-token-uri",
        [types.uint(1)],
        wallet_1.address
      ),
    ]);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 2);
    block.receipts[0].result
      .expectOk()
      .expectSome()
      .expectAscii("https://www.explorerguild.io/api/metadata/1.json");
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result
      .expectOk()
      .expectSome()
      .expectAscii("ar://arweave-id/1.json");
  },
});
