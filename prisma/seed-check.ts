// This runs at build time to ensure DB is seeded
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log(`Database has ${count} users`);
  if (count === 0) {
    console.log("Running seed...");
    require("child_process").execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  }
}

main().finally(() => prisma.$disconnect());
