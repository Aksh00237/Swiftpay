# SwiftPay

A UPI-style payments backend built as independent Spring Boot services, with a React frontend.
Supports peer-to-peer transfers (P2P), merchant payments with a platform commission (P2M), and mobile recharges.

## Architecture

```
                 ┌──────────────────────┐
                 │   React frontend     │  :3000
                 └──────────┬───────────┘
        ┌───────────────────┼──────────────────────────┐
        ▼                   ▼                          ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────────────────────┐
│  p2p-service  │   │  p2m-service  │   │  recharge-service (x3)       │
│     :8081     │   │     :8082     │   │  :8083  :8087  :8088         │
└───────┬───────┘   └───────┬───────┘   └──────────────┬───────────────┘
        └─────────┬─────────┘                          │
                  ▼                                    ▼
        MongoDB  db: swiftpay                 MongoDB  db: swiftpay_recharge
        users, merchants,                     recharges
        transactions, merchant_txns
```

| Service | Port | Responsibility |
|---|---|---|
| p2p-service | 8081 | Wallet-to-wallet transfers |
| p2m-service | 8082 | User-to-merchant payments with a fixed ₹10 platform commission |
| recharge-service | 8083 (+8087, 8088) | Mobile recharge requests (Jio, Airtel, Vi) |
| frontend | 3000 | React UI for all three flows |

**Tech stack:** Java 17, Spring Boot 4, Spring Data MongoDB, MongoDB 7 (replica set), React, Gradle, Lombok.

## Running locally

**Prerequisites:** JDK 17+, Node 18+, and Docker (or a local MongoDB started as a replica set).

1. **Start MongoDB as a replica set** (needed for transactions):
   ```bash
   docker compose up -d
   ```
   Without Docker, start `mongod --replSet rs0` and run `rs.initiate()` once in `mongosh`.

2. **Seed demo wallets:**
   ```bash
   mongosh "mongodb://localhost:27017/?directConnection=true" scripts/seed.js
   ```
   This creates `user1` (₹5000), `user2` (₹1000), `user3` (₹50), `merchant1` and `merchant2`.

3. **Start the services** (each in its own terminal):
   ```bash
   cd p2p-service && ./gradlew bootRun
   cd p2m-service && ./gradlew bootRun
   cd recharge-service && ./gradlew bootRun
   # optional extra recharge instances
   cd recharge-service && ./gradlew bootRun --args='--server.port=8087'
   cd recharge-service && ./gradlew bootRun --args='--server.port=8088'
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
- **Commission is per-transaction data.** Platform revenue is the sum of `commission` across successful merchant transactions, rather than an in-memory counter that resets on restart.

## Known limitations and next steps

These are deliberate scope cuts for now:

- **Shared wallet data.** p2p and p2m both read the `users` collection directly. The next step is a dedicated wallet service that owns balances, with p2p and p2m calling it over HTTP.
- **No idempotency keys.** A client retry after a timeout could create a second transfer. Next step: accept an `Idempotency-Key` header with a unique index on it.
- **No authentication.** Any caller can move any user's money. Next step: JWT auth at an API gateway.
- **Recharge doesn't debit a wallet.** It validates and records the request only.
- **Recharge instance selection is client-side random**, for demo purposes. In production this sits behind an API gateway or load balancer.
- **Tests** are limited to context-load tests; service-level unit tests and a concurrency test for double-spend are next.
