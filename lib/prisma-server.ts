import { PrismaClient } from "@prisma/client"

// PrismaClient configuration specifically for better serverless handling
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Add connection parameters for better serverless handling
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

// Global type with proper declaration
type PrismaGlobal = {
  prisma: PrismaClient | undefined
}

// Create global for PrismaClient with proper type
const globalForPrisma = global as unknown as PrismaGlobal

// Export singleton pattern with null coalescing
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

// Only set global in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma