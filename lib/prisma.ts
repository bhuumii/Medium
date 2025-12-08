// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` in TS
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["warn", "error"], // or ["query"] if you like
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
