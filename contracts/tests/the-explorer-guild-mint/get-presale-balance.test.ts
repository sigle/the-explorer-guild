import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";

Clarinet.test({
  name: "[get-presale-balance] Should return 0 for non whitelisted addresses",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_9 = accounts.get("wallet_9")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "get-presale-balance",
        [types.principal(wallet_9.address)],
        wallet_9.address
      ),
    ]);

    block.receipts[0].result.expectUint(0);
  },
});

Clarinet.test({
  name: "[get-presale-balance] Should return 2 for whitelisted address",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "get-presale-balance",
        [types.principal(wallet_1.address)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectUint(2);
  },
});
