;; Store the whitelisted addresses and number of pre-mint allowed
(define-map presale-count principal uint)

(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u403)) ;; Forbidden
(define-constant err-presale-not-active (err u10))
(define-constant err-sale-not-active (err u11))
(define-constant err-no-presale-spot-remaining (err u12))

;; Store if the presale is active or not
(define-data-var presale-active bool false)
;; Store if the sale is active or not
(define-data-var sale-active bool false)

;; Claim a new NFT
(define-public (claim)
  (if (var-get presale-active)
    (presale-mint tx-sender)
    (public-mint tx-sender)))

(define-public (claim-two)
  (begin
    (try! (claim))
    (try! (claim))
    (ok true)))

(define-public (claim-three)
  (begin
    (try! (claim))
    (try! (claim))
    (try! (claim))
    (ok true)))

(define-public (claim-four)
  (begin
    (try! (claim))
    (try! (claim))
    (try! (claim))
    (try! (claim))
    (ok true)))

(define-public (claim-five)
  (begin
    (try! (claim))
    (try! (claim))
    (try! (claim))
    (try! (claim))
    (try! (claim))
    (ok true)))

;; Get the remaning presale balance for a principal
(define-read-only (get-presale-balance (account principal))
  (default-to u0
    (map-get? presale-count account)))

;; Internal - Mint NFT using presale mechanism
(define-private (presale-mint (new-owner principal))
  (let ((presale-balance (get-presale-balance new-owner)))
    (asserts! (> presale-balance u0) err-no-presale-spot-remaining)
    (map-set presale-count
              new-owner
              (- presale-balance u1))
  (contract-call? .the-explorer-guild mint new-owner)))

;; Internal - Mint public sale NFT
(define-private (public-mint (new-owner principal))
  (begin
    (asserts! (var-get sale-active) err-sale-not-active)
    (contract-call? .the-explorer-guild mint new-owner)))

(define-public (enable-presale)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-owner)
    (var-set sale-active false)
    (var-set presale-active true)
    (ok true)))

(define-public (enable-sale)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-owner)
    (var-set presale-active false)
    (var-set sale-active true)
    (ok true)))

;; In case of issue during the mint allow contract owner to disable the sale
(define-public (disable-sale)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-owner)
    (var-set presale-active false)
    (var-set sale-active false)
    (ok true)))

;; Register this contract as allowed to mint
(as-contract (contract-call? .the-explorer-guild set-mint-address))

;; Whitelisted addresses
;; Test addresses, will be replaced
(map-set presale-count 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u2)
(map-set presale-count 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u2)
