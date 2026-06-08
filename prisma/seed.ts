// prisma/seed.ts
// Run this once to create the default admin user:
//   npx ts-node prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "admin123";

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists.");
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hashed } });

  console.log("✅ Admin user created:");
  console.log("   Email:   ", email);
  console.log("   Password:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
