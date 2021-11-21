(define-constant contract-owner tx-sender)
(define-constant err-failed-to-transfer-stx (err u10))
(define-constant err-failed-to-transfer-nft (err u11))

;; Mint 497 Explorers
(define-public (mint-497)
  (begin
    ;; Enable the sale so contract can mint
    (try! (contract-call? .the-explorer-guild-mint enable-sale))
    ;; Transfer 497 STX to the contract in order to mint
    (unwrap! (stx-transfer? u497 contract-owner (as-contract tx-sender)) err-failed-to-transfer-stx)
    ;; Reduce contract price in order to mint
    ;; Not possible to set to 0 as stx-transfer will fail
    (try! (contract-call? .the-explorer-guild set-mint-price u1))
    ;; TODO mint 497, 71 * 7
    (try! (as-contract (contract-call? .the-explorer-guild-mint claim-seven)))
    ;; Contract own the NFTs so transfer them to another address
    (try! (as-contract (contract-call? .the-explorer-guild transfer u1 (as-contract tx-sender) contract-owner)))
    (try! (as-contract (contract-call? .the-explorer-guild transfer u2 (as-contract tx-sender) contract-owner)))
    (try! (as-contract (contract-call? .the-explorer-guild transfer u3 (as-contract tx-sender) contract-owner)))
    (try! (as-contract (contract-call? .the-explorer-guild transfer u4 (as-contract tx-sender) contract-owner)))
    (try! (as-contract (contract-call? .the-explorer-guild transfer u5 (as-contract tx-sender) contract-owner)))
    (try! (as-contract (contract-call? .the-explorer-guild transfer u6 (as-contract tx-sender) contract-owner)))
    (try! (as-contract (contract-call? .the-explorer-guild transfer u7 (as-contract tx-sender) contract-owner)))
    ;; Restore mint price
    (try! (contract-call? .the-explorer-guild set-mint-price u100000000))
    ;; Disable the sale to not allow new mints
    (try! (contract-call? .the-explorer-guild-mint disable-sale))
    (ok true)))
