// lib/prisma.js
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Export the instance
export { prisma };
