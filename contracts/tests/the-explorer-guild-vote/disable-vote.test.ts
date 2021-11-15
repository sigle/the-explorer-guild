import { Clarinet, Tx, Chain, Account } from "../packages.ts";

Clarinet.test({
  name: "[disable-vote] Should throw error if non contract owner try to disable the vote",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-vote",
        "disable-vote",
        [],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[disable-vote] Can disable vote",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-vote",
        "disable-vote",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
  },
});
