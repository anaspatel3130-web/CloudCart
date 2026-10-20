/**
 * Inserts sample products into PRODUCTS_TABLE.
 *
 * Safety: refuses to run unless SEED_CONFIRM=yes.
 * Does not run during Lambda invocations.
 *
 * Usage (from backend/):
 *   SEED_CONFIRM=yes PRODUCTS_TABLE=CloudCart-Products node scripts/seed-products.js
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const tableName = String(process.env.PRODUCTS_TABLE || "").trim();
const confirm = String(process.env.SEED_CONFIRM || "").trim().toLowerCase();

if (confirm !== "yes") {
  console.error("Refusing to seed: set SEED_CONFIRM=yes to write to DynamoDB.");
  process.exit(1);
}

if (!tableName) {
  console.error("PRODUCTS_TABLE is required.");
  process.exit(1);
}

const seedPath = join(dirname(fileURLToPath(import.meta.url)), "seed-data.json");
const products = JSON.parse(await readFile(seedPath, "utf8"));
const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

for (const product of products) {
  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: product,
    })
  );
  console.log(`seeded ${product.id}`);
}

console.log(`Seeded ${products.length} products into ${tableName}.`);
