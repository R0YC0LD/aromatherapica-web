import { PrismaClient } from "@prisma/client";
import fs from "node:fs";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.productCache.findMany();
  const categories = await prisma.categoryCache.findMany();
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync("data/seed-catalog.json", JSON.stringify({ products, categories }, null, 2));
  console.log(`seed written: ${products.length} products, ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
