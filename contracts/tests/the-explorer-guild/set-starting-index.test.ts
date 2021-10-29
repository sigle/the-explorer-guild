import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";
import { assert, assertEquals } from "../packages.ts";
import { maxMintNumber } from "../config.ts";

Clarinet.test({
  name: "[set-starting-index] Should throw error if non contract owner try to set the starting index",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "set-starting-index",
        [],
        wallet_1.address
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[set-starting-index] Can be set only once",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "set-starting-index",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "set-starting-index",
        [],
        wallet_deployer.address
      ),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectErr().expectUint(15);
  },
});

Clarinet.test({
  name: "[set-starting-index] Contract owner can trigger the random index generation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "get-starting-index",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "set-starting-index",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "get-starting-index",
        [],
        wallet_deployer.address
      ),
    ]);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectUint(0);
    block.receipts[1].result.expectOk().expectBool(true);
    // Get the number from the response
    const startingIndex = Number(
      block.receipts[2].result.expectOk().replace("u", "")
    );
    assert(startingIndex > 0);
    assert(startingIndex < maxMintNumber);
  },
});
