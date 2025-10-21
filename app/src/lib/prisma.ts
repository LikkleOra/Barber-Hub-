import { PrismaClient } from "@prisma/client";

declare global {
  // Note: using `var` is required for Node.js global augmentation
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
