// lib/prisma.ts
// Creates a single Prisma client instance shared across the app.
// In development, Next.js hot-reloads can create many DB connections
// without this singleton pattern.

import { PrismaClient } from "@prisma/client";

// Extend the global object to hold our Prisma instance
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
