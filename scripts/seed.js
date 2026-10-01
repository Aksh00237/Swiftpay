// Seeds demo wallets. Run with: mongosh "mongodb://localhost:27017/?directConnection=true" scripts/seed.js
// version is required because wallets use optimistic locking (@Version).
const swiftpay = db.getSiblingDB("swiftpay");

swiftpay.users.deleteMany({});
swiftpay.merchants.deleteMany({});

swiftpay.users.insertMany([
  { _id: "user1", balance: NumberDecimal("5000.00"), version: NumberLong(0) },
  { _id: "user2", balance: NumberDecimal("1000.00"), version: NumberLong(0) },
  { _id: "user3", balance: NumberDecimal("50.00"), version: NumberLong(0) },
]);

swiftpay.merchants.insertMany([
  { _id: "merchant1", balance: NumberDecimal("0.00"), version: NumberLong(0) },
  { _id: "merchant2", balance: NumberDecimal("0.00"), version: NumberLong(0) },
]);

print("Seeded users: user1, user2, user3 and merchants: merchant1, merchant2");
