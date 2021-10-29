import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";
import { assertEquals } from "../packages.ts";

Clarinet.test({
  name: "[set-mint-price] Should throw error if non contract owner try to update the mint price",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "set-mint-price",
        [types.uint(1)],
        wallet_1.address
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[set-mint-price] Contract owner can update mint price properly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "set-mint-price",
        [types.uint(1)],
        wallet_deployer.address
      ),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    block.receipts[0].result.expectOk().expectBool(true);
  },
});
