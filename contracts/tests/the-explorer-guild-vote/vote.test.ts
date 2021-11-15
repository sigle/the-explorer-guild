import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";

Clarinet.test({
  name: "[vote] Can vote only once per wallet",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-vote",
        "enable-vote",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(1)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectErr().expectUint(11);
  },
});

Clarinet.test({
  name: "[vote] Only some options are accepted",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-vote",
        "enable-vote",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(0)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(3)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(2)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    // 0 check
    block.receipts[1].result.expectErr().expectUint(12);
    // 3 check
    block.receipts[2].result.expectErr().expectUint(12);
    // 2 check
    block.receipts[3].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "[vote] Vote should work properly for same option",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-vote",
        "enable-vote",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(1)],
        wallet_2.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "get-vote-option-balance",
        [types.uint(1)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[3].result.expectUint(7);
  },
});

Clarinet.test({
  name: "[vote] Vote should work properly for all options",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let wallet_2 = accounts.get("wallet_2")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-vote",
        "enable-vote",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "vote",
        [types.uint(2)],
        wallet_2.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "get-vote-option-balance",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall(
        "the-explorer-guild-vote",
        "get-vote-option-balance",
        [types.uint(2)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectBool(true);
    block.receipts[3].result.expectUint(2);
    block.receipts[4].result.expectUint(5);
  },
});
