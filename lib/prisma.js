// lib/prisma.js
import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  // In production, simply create a new PrismaClient using DATABASE_URL.
  // (If you need Neon adapter, you can add it here, but avoid top-level await.)
  prisma = new PrismaClient();
} else {
  // In dev, attach to global to prevent hot-reload duplication.
  // `globalThis` works in Node and modern runtimes.
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient();
  }
  prisma = globalThis.__prisma;
}

export default prisma;
