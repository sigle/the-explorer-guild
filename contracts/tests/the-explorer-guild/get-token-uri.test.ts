import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";

const rootApiUrl = "https://www.explorerguild.io";

Clarinet.test({
  name: "[get-token-uri] Should return the metadata url with id 1",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "get-token-uri",
        [types.uint(1)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result
      .expectOk()
      .expectSome()
      .expectAscii(`${rootApiUrl}/api/metadata/1.json`);
  },
});

Clarinet.test({
  name: "[get-token-uri] Should return the metadata url with id 10000",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild",
        "get-token-uri",
        [types.uint(10000)],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result
      .expectOk()
      .expectSome()
      .expectAscii(`${rootApiUrl}/api/metadata/10000.json`);
  },
});
