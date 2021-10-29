import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";

Clarinet.test({
  name: "[transfer] Should throw error if non NFT owner try to transfer it",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-sale",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
      Tx.contractCall(
        "the-explorer-guild",
        "transfer",
        [
          types.uint(1),
          types.principal(wallet_2.address),
          types.principal(wallet_1.address),
        ],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectUint(1);
    block.receipts[2].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[transfer] NFT owner can transfer it",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-sale",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
      Tx.contractCall(
        "the-explorer-guild",
        "transfer",
        [
          types.uint(1),
          types.principal(wallet_1.address),
          types.principal(wallet_2.address),
        ],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectUint(1);
    block.receipts[2].result.expectOk().expectBool(true);
  },
});
