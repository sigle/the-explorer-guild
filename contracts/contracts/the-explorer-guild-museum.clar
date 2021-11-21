(define-constant contract-owner tx-sender)
(define-constant err-failed-to-transfer (err u11))

;; TODO throw error if trying to mint more than 497 via mint function

;; Mint up to 497 Explorers in total
;; Calling this function will mint 71 NFTs. 71 * 7 = 497
(define-public (mint)
  (begin
    ;; Enable the sale so contract can mint
    (try! (contract-call? .the-explorer-guild-mint enable-sale))
    ;; Transfer 71 STX to the contract in order to mint
    (unwrap! (stx-transfer? u71 contract-owner (as-contract tx-sender)) err-failed-to-transfer)
    ;; Reduce contract price in order to mint
    ;; Not possible to set to 0 as stx-transfer will fail with u3
    (try! (contract-call? .the-explorer-guild set-mint-price u1))
    (map claim-transfer (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39 u40 u41 u42 u43 u44 u45 u46 u47 u48 u49 u50 u51 u52 u53 u54 u55 u56 u57 u58 u59 u60 u61 u62 u63 u64 u65 u66 u67 u68 u69 u70 u71))
    ;; Restore mint price
    (try! (contract-call? .the-explorer-guild set-mint-price u100000000))
    ;; Disable the sale to not allow new mints
    (try! (contract-call? .the-explorer-guild-mint disable-sale))
    (ok true)))

;; Claim an NFT and transfer it to the contract owner wallet
(define-private (claim-transfer (index uint))
  (let (
    (claim-id (try! (as-contract (contract-call? .the-explorer-guild-mint claim))))
  )
    (as-contract (contract-call? .the-explorer-guild transfer claim-id (as-contract tx-sender) contract-owner))))

;; Explorers minted will be kept in the contract wallet and are non-transferrable
(define-public (burn)
  (begin
    ;; Enable the sale so contract can mint
    (try! (contract-call? .the-explorer-guild-mint enable-sale))
    ;; Transfer 100 STX to the contract in order to mint
    (unwrap! (stx-transfer? u100 contract-owner (as-contract tx-sender)) err-failed-to-transfer)
    ;; Reduce contract price in order to mint
    ;; Not possible to set to 0 as stx-transfer will fail with u3
    (try! (contract-call? .the-explorer-guild set-mint-price u1))
    (map claim-burn (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10 u11 u12 u13 u14 u15 u16 u17 u18 u19 u20 u21 u22 u23 u24 u25 u26 u27 u28 u29 u30 u31 u32 u33 u34 u35 u36 u37 u38 u39 u40 u41 u42 u43 u44 u45 u46 u47 u48 u49 u50 u51 u52 u53 u54 u55 u56 u57 u58 u59 u60 u61 u62 u63 u64 u65 u66 u67 u68 u69 u70 u71 u72 u73 u74 u75 u76 u77 u78 u79 u80 u81 u82 u83 u84 u85 u86 u87 u88 u89 u90 u91 u92 u93 u94 u95 u96 u97 u98 u99 u100))
    ;; Restore mint price
    (try! (contract-call? .the-explorer-guild set-mint-price u100000000))
    ;; Disable the sale to not allow new mints
    (try! (contract-call? .the-explorer-guild-mint disable-sale))
    (ok true)))

;; Claim an NFT
(define-private (claim-burn (index uint))
  (begin
    (as-contract (contract-call? .the-explorer-guild-mint claim))))
