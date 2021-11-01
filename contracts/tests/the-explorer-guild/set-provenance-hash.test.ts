import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";

Clarinet.test({
  name: "[set-provenance-hash] Should throw error if non contract owner try to update the provenance hash",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "set-provenance-hash",
        [types.ascii("test")],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: "[set-provenance-hash] Contract owner can update mint price properly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "get-provenance-hash",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "set-provenance-hash",
        [types.ascii("test")],
        wallet_deployer.address
      ),
      Tx.contractCall(
        "the-explorer-guild",
        "get-provenance-hash",
        [],
        wallet_deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk().expectAscii("");
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectAscii("test");
  },
});
