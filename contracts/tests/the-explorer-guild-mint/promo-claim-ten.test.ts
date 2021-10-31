import { Clarinet, Tx, Chain, Account, types } from "../packages.ts";
import { promoMintNumber } from "../config.ts";

Clarinet.test({
  name: "[promo-claim-ten] Should throw error if non contract owner try to claim",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "promo-claim-ten",
        [],
        wallet_1.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(403);
  },
});

Clarinet.test({
  name: `[promo-claim-ten] Should only allow ${promoMintNumber} NFT to be minted`,
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-sale",
        [],
        wallet_deployer.address
      ),
    ]);

    for (let index = 0; index < promoMintNumber / 10; index++) {
      block = chain.mineBlock([
        Tx.contractCall(
          "the-explorer-guild-mint",
          "promo-claim-ten",
          [],
          wallet_deployer.address
        ),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    }

    block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "promo-claim-ten",
        [],
        wallet_deployer.address
      ),
    ]);
    block.receipts[0].result.expectErr().expectUint(13);
  },
});
