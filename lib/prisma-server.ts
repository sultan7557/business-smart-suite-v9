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
    // Production optimizations
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pooling for production
    ...(process.env.NODE_ENV === 'production' && {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }),
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

// Add query performance monitoring
prisma.$use(async (params, next) => {
  const start = Date.now()
  const result = await next(params)
  const duration = Date.now() - start
  
  // Log slow queries in production
  if (duration > 1000 && process.env.NODE_ENV === 'production') {
    console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`)
  }
  
  return result
})

export default prisma