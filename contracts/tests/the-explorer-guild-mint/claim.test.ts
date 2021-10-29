import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
  assertEquals,
} from "../packages.ts";
import { maxMintNumber } from "../config.ts";

Clarinet.test({
  name: "[claim] Should throw error if sale is not active",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(11);
  },
});

Clarinet.test({
  name: "[claim] Should be able to claim when sale is active",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-sale",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(11);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "[claim] Should be able to claim when presale is active",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-presale",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
    ]);

    block.receipts[0].result.expectErr().expectUint(11);
    block.receipts[1].result.expectOk().expectBool(true);
    block.receipts[2].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "[claim] Should not be able to mint more than presale pass owned",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-presale",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectUint(1);
    block.receipts[2].result.expectOk().expectUint(2);
    block.receipts[3].result.expectErr().expectUint(12);
  },
});

Clarinet.test({
  name: `[claim] Should only allow ${maxMintNumber} NFT to be minted`,
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-sale",
        [],
        wallet_deployer.address
      ),
    ]);

    for (let index = 0; index < maxMintNumber; index++) {
      block = chain.mineBlock([
        Tx.contractCall(
          "the-explorer-guild-mint",
          "claim",
          [],
          wallet_1.address
        ),
      ]);
      block.receipts[0].result.expectOk().expectUint(index + 1);
    }

    block = chain.mineBlock([
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
    ]);
    block.receipts[0].result.expectErr().expectUint(12);
  },
});

Clarinet.test({
  name: "[mint] Minting should transfer mint price to contract owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let wallet_deployer = accounts.get("deployer")!;
    let wallet_1 = accounts.get("wallet_1")!;
    let assetMaps = chain.getAssetsMaps();
    const balanceWalletDeployer =
      assetMaps.assets["STX"][wallet_deployer.address];
    const balanceWallet1 = assetMaps.assets["STX"][wallet_1.address];

    let block = chain.mineBlock([
      Tx.contractCall(
        "the-explorer-guild-mint",
        "enable-sale",
        [],
        wallet_deployer.address
      ),
      Tx.contractCall("the-explorer-guild-mint", "claim", [], wallet_1.address),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
    block.receipts[1].result.expectOk().expectUint(1);

    let [event] = block.receipts[1].events;

    let { sender, recipient, amount } = event.stx_transfer_event;
    sender.expectPrincipal(wallet_1.address);
    recipient.expectPrincipal(wallet_deployer.address);
    amount.expectInt(10000000);

    assetMaps = chain.getAssetsMaps();
    assertEquals(
      assetMaps.assets["STX"][wallet_deployer.address],
      balanceWalletDeployer + 10000000
    );
    assertEquals(
      assetMaps.assets["STX"][wallet_1.address],
      balanceWallet1 - 10000000
    );
  },
});
