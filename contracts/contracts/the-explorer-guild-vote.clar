(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u403)) ;; Forbidden
(define-constant err-vote-not-active (err u10))
(define-constant err-no-vote-remaining (err u11))
(define-constant err-no-vote-option (err u12))

(define-map vote-count principal uint)
(define-map vote-options uint uint)
(define-data-var vote-active bool false)

;; Get the remaning vote balance for a principal
(define-read-only (get-vote-balance (account principal))
  (default-to u0
    (map-get? vote-count account)))

(define-read-only (get-vote-option-balance (vote-option uint))
  (default-to u0
    (map-get? vote-options vote-option)))

;; Vote for a principal
(define-public (vote (vote-option uint))
  (begin
    (asserts! (var-get vote-active) err-vote-not-active)
    ;; Only option 1 and 2 are accepted
    (asserts! (> vote-option u0) err-no-vote-option)
    (asserts! (< vote-option u3) err-no-vote-option)
    (let (
      (vote-balance (get-vote-balance tx-sender))
      (vote-option-balance (get-vote-option-balance vote-option))
    )
      (asserts! (> vote-balance u0) err-no-vote-remaining)
      (map-set vote-count tx-sender u0)
      (map-set vote-options vote-option (+ vote-balance vote-option-balance))
      (ok true))))

(define-public (enable-vote)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-owner)
    (var-set vote-active true)
    (ok true)))

(define-public (disable-vote)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-not-owner)
    (var-set vote-active false)
    (ok true)))

;; Test addresses, will be replaced
(map-set vote-count 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5 u2)
(map-set vote-count 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG u5)
