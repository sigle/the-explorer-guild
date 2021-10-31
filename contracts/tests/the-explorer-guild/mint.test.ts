import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";

Clarinet.test({
  name: "[mint] Should not be able to mint if called directly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "mint",
        [types.principal(wallet_1.address), types.bool(false)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});
