# SwiftPay

A UPI-style payments backend built as independent Spring Boot services, with a React frontend.
Supports peer-to-peer transfers (P2P), merchant payments with a platform commission (P2M), mobile recharges, and **Safe Pay**: escrow payments for buying from people you don't know.

**Why Safe Pay:** buying from a seller on Instagram, WhatsApp or OLX means trusting a stranger with your money. With Safe Pay the buyer pays SwiftPe, the money is held, and the seller is paid only after the buyer confirms delivery. Timeouts make sure money never stays stuck: an unshipped order is refunded automatically, and a shipped order the buyer ignores is paid out automatically. Disputes freeze the money until an admin decides.

## Architecture

```
                 ┌──────────────────────┐
                 │   React frontend     │  :3000
                 └──────────┬───────────┘
     ┌──────────────┬───────┴──────┬──────────────────────────┐
     ▼              ▼              ▼                          ▼
┌───────────┐ ┌───────────┐ ┌──────────────┐   ┌──────────────────────────────┐
│p2p-service│ │p2m-service│ │escrow-service│   │  recharge-service (x3)       │
│   :8081   │ │   :8082   │ │    :8084     │   │  :8083  :8087  :8088         │
└─────┬─────┘ └─────┬─────┘ └──────┬───────┘   └──────────────┬───────────────┘
      └─────────────┼──────────────┘                          │
                    ▼                                         ▼
          MongoDB  db: swiftpay                      MongoDB  db: swiftpay_recharge
          users, merchants, transactions,            recharges
          merchant_txns, escrow_orders
```

| Service | Port | Responsibility |
|---|---|---|
| p2p-service | 8081 | Wallet-to-wallet transfers |
| p2m-service | 8082 | User-to-merchant payments with a fixed ₹10 platform commission |
| escrow-service | 8084 | Safe Pay: holds the buyer's money until delivery is confirmed, with auto-refund, auto-release and disputes |
| recharge-service | 8083 (+8087, 8088) | Mobile recharge requests (Jio, Airtel, Vi) |
| frontend | 3000 | React UI for all three flows |

**Tech stack:** Java 17, Spring Boot 4, Spring Data MongoDB, MongoDB (replica set), React, Gradle, Lombok.

## Running locally

**Prerequisites:** JDK 17+, Node 18+, MongoDB 7+ (with `mongosh`).

1. **Run MongoDB as a single-node replica set** (multi-document transactions need a replica set).

   macOS (Homebrew):
   ```bash
   brew tap mongodb/brew && brew install mongodb-community
   ```
   Add this to `mongod.conf` (`/opt/homebrew/etc/mongod.conf` on Apple Silicon, `/usr/local/etc/mongod.conf` on Intel):
   ```yaml
   replication:
     replSetName: rs0
   ```
   Then restart and initiate once:
   ```bash
   brew services restart mongodb-community
   mongosh --eval "rs.initiate()"
   ```
   A free MongoDB Atlas cluster also works (it is a replica set by default); set `spring.mongodb.uri` to its connection string.

2. **Seed demo wallets:**
   ```bash
   mongosh "mongodb://localhost:27017/?directConnection=true" scripts/seed.js
   ```
   This creates `user1` (₹5000), `user2` (₹1000), `user3` (₹50), `merchant1` and `merchant2`.

3. **Start the services** (each in its own terminal):
   ```bash
   cd p2p-service && ./gradlew bootRun
   cd p2m-service && ./gradlew bootRun
   cd escrow-service && ./gradlew bootRun
   cd recharge-service && ./gradlew bootRun
   # optional extra recharge instances
   cd recharge-service && ./gradlew bootRun --args='--server.port=8087'
   cd recharge-service && ./gradlew bootRun --args='--server.port=8088'
   ```

   To watch the escrow timeouts work in a demo, start escrow-service with short windows:
   ```bash
   cd escrow-service && ./gradlew bootRun --args='--escrow.delivery-window=2m --escrow.confirm-window=2m --escrow.scheduler-delay-ms=10000'
   ```

4. **Start the frontend:**
   ```bash
   cd frontend && npm install && npm start
   ```

## API

All money values are decimals with at most 2 decimal places. Errors share one shape:

```json
{ "error": "PAYMENT_FAILED", "message": "Insufficient balance", "transactionId": "66fb..." }
```

### P2P transfer

`POST /p2p/sendMoney`

```bash
curl -X POST localhost:8081/p2p/sendMoney -H "Content-Type: application/json" \
  -d '{"senderId":"user1","receiverId":"user2","amount":250.00}'
```

| Status | When |
|---|---|
| 200 | Transfer succeeded; returns the transaction |
| 400 | Missing ids, same sender and receiver, amount ≤ 0, or more than 2 decimals |
| 404 | Sender or receiver not found |
| 409 | Concurrent update on the same wallet; safe to retry |
| 422 | Insufficient balance; a `FAILED` transaction is recorded |

### P2M payment

`POST /p2m/pay`

```bash
curl -X POST localhost:8082/p2m/pay -H "Content-Type: application/json" \
  -d '{"userId":"user1","merchantId":"merchant1","amount":500.00}'
```

The user is debited the full amount, the merchant is credited `amount - 10`, and the commission is stored on the transaction. Status codes match P2P; amounts of ₹10 or less are rejected with 400.

### Safe Pay (escrow)

The caller's identity is sent in the `X-User-Id` header; the service checks that the caller is the buyer, the seller or the admin (`escrow.admin-id`, default `admin`) before every action.

```
HELD ──ship──▶ SHIPPED ──confirm / auto-release──▶ RELEASED   (seller paid)
 │                │
 │                └──dispute──▶ DISPUTED ──admin──▶ RELEASED or REFUNDED
 │
 └──seller cancels / delivery deadline missed──▶ REFUNDED     (buyer refunded)
```

| Endpoint | Who | What happens |
|---|---|---|
| `POST /escrow` | Buyer | Debits the buyer and creates an order in `HELD`. Send an `Idempotency-Key` header so a retry doesn't charge twice |
| `POST /escrow/{id}/ship` | Seller | `HELD → SHIPPED`; starts the confirm window |
| `POST /escrow/{id}/cancel` | Seller | `HELD → REFUNDED`; buyer gets the money back |
| `POST /escrow/{id}/confirm` | Buyer | `SHIPPED → RELEASED`; seller is credited |
| `POST /escrow/{id}/dispute` | Buyer or seller | `SHIPPED → DISPUTED`; body `{"reason": "..."}`; money is frozen |
| `POST /escrow/{id}/resolve` | Admin | `DISPUTED → REFUNDED` or `RELEASED`; body `{"outcome": "REFUND" \| "RELEASE"}` |
| `GET /escrow` | Anyone | Orders where the caller is buyer or seller |
| `GET /escrow/{id}` | Buyer, seller, admin | One order with its full status history |
| `GET /escrow/disputed` | Admin | Open disputes |

A scheduler runs every minute: `HELD` orders past their delivery deadline (default 72h) are refunded, and `SHIPPED` orders past their auto-release time (default 120h) are paid to the seller.

Example (user1 buys from user2):

```bash
# Buyer pays ₹500; the money leaves user1 but doesn't reach user2 yet
curl -X POST localhost:8084/escrow -H "Content-Type: application/json" \
  -H "X-User-Id: user1" -H "Idempotency-Key: 7f1c2a90-order-1" \
  -d '{"sellerId":"user2","amount":500.00,"description":"Custom phone cover"}'

# Seller ships, buyer confirms: user2 is credited ₹500
curl -X POST localhost:8084/escrow/<id>/ship    -H "X-User-Id: user2"
curl -X POST localhost:8084/escrow/<id>/confirm -H "X-User-Id: user1"
```

| Status | When |
|---|---|
| 200 | Action applied; returns the order |
| 400 | Missing `X-User-Id`, invalid amount, buyer = seller, dispute without a reason |
| 403 | Caller isn't allowed (e.g. the seller trying to confirm) |
| 404 | Order, buyer or seller not found |
| 409 | Action not allowed in the current status (e.g. confirming twice), or a concurrent update; safe to retry |
| 422 | Insufficient balance |

### Recharge

`POST /recharge/do`

```bash
curl -X POST localhost:8083/recharge/do -H "Content-Type: application/json" \
  -d '{"mobileNumber":"9876543210","operator":"jio","amount":299}'
```

Returns 200 on success, or 400 with a reason (`INVALID_MOBILE`, `INVALID_OPERATOR`, `INVALID_AMOUNT`). Failed attempts are stored too.

## Design decisions

- **Atomic money movement.** The debit, the credit and the transaction record are written inside one MongoDB transaction (`@Transactional` with `MongoTransactionManager`). If anything fails midway, nothing is applied, so money can't disappear between the two wallet updates. This is why MongoDB must run as a replica set.
- **No double-spend under concurrency.** Wallets carry a `@Version` field (optimistic locking). If two requests read the same balance and both try to write, the second write fails and the API returns 409 instead of overspending. MongoDB's own write-conflict detection inside transactions adds a second layer.
- **`BigDecimal`, never `double`.** Floating point can't represent values like 0.1 exactly, so balances drift. Money is `BigDecimal` in Java and `Decimal128` in MongoDB, limited to 2 decimal places.
- **Failures are recorded, not just returned.** Insufficient-balance payments and invalid recharges are saved with status `FAILED` and a reason, which gives an audit trail. For payments, the transaction is configured not to roll back on this business failure so the record is kept.
- **Escrow is a state machine with one gate.** Every allowed status move is listed in `EscrowStatus`, and `EscrowOrder.moveTo()` is the only way to change status. Illegal moves (confirming before shipping, releasing an already refunded order) are rejected from every code path, and each move is appended to the order's `history` as an audit trail (who, when, why; `system` for the scheduler).
- **Held money lives on the order, not in a second wallet field.** While an order is `HELD`/`SHIPPED`/`DISPUTED`, its amount has left the buyer's balance and is owed to exactly one party. p2p and p2m save the whole `users` document, so a separate `heldBalance` field there could be overwritten by them.
- **The seller can't be paid twice.** Escrow orders carry a `@Version`. If the buyer confirms at the same moment the scheduler auto-releases, both read version N, the first write wins, and the second fails and rolls back its wallet credit with it.
- **The scheduler re-checks before acting.** It finds expired orders, then handles each one in its own transaction that reloads the order and verifies the status and deadline again, because the buyer or seller may have acted in between. One failing order doesn't stop the rest.
- **Idempotent order creation.** `Idempotency-Key` has a unique index, so a double click or a network retry returns the existing order instead of debiting the buyer again.
- **Commission is per-transaction data.** Platform revenue is the sum of `commission` across successful merchant transactions, rather than an in-memory counter that resets on restart.

## Known limitations and next steps

These are deliberate scope cuts for now:

- **Shared wallet data.** p2p and p2m both read the `users` collection directly. The next step is a dedicated wallet service that owns balances, with p2p and p2m calling it over HTTP.
- **Idempotency keys only on escrow.** A P2P or P2M retry after a timeout could create a second transfer. Next step: the same `Idempotency-Key` approach escrow uses.
- **No authentication.** Any caller can move any user's money. Escrow takes the caller from an `X-User-Id` header and enforces who may do what (authorization), but nothing verifies that header (authentication). Next step: JWT auth at an API gateway, which would supply the same user id.
- **Recharge doesn't debit a wallet.** It validates and records the request only.
- **Recharge instance selection is client-side random**, for demo purposes. In production this sits behind an API gateway or load balancer.
- **Tests:** escrow-service has unit tests for the state machine and its business rules (who can act, timeouts, no double payout). The other services only have context-load tests, and an integration test against a real replica set is next.
- **Dispute evidence** is just a text reason; there are no photo uploads or messages between buyer and seller.
