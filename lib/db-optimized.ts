import { PrismaClient } from "@prisma/client"
import redis from "@/lib/redis"

// Optimized PrismaClient with connection pooling
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Global type with proper declaration
type PrismaGlobal = {
  prisma: PrismaClient | undefined
}

const globalForPrisma = global as unknown as PrismaGlobal
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Query performance monitoring middleware
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

// Optimized database utilities with caching
export class OptimizedDB {
  private static instance: OptimizedDB
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): OptimizedDB {
    if (!OptimizedDB.instance) {
      OptimizedDB.instance = new OptimizedDB()
    }
    return OptimizedDB.instance
  }

  // Cached query with Redis fallback
  async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300 // 5 minutes default
  ): Promise<T> {
    // Check memory cache first
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      return cached.data
    }

    // Check Redis cache
    try {
      const redisCached = await redis.get(key)
      if (redisCached) {
        const data = JSON.parse(redisCached)
        this.cache.set(key, { data, timestamp: Date.now(), ttl })
        return data
      }
    } catch (error) {
      console.warn('Redis cache error:', error)
    }

    // Execute query and cache result
    const data = await queryFn()
    
    // Cache in memory
    this.cache.set(key, { data, timestamp: Date.now(), ttl })
    
    // Cache in Redis
    try {
      await redis.setex(key, ttl, JSON.stringify(data))
    } catch (error) {
      console.warn('Redis set error:', error)
    }

    return data
  }

  // Batch query optimization
  async batchQuery<T>(queries: Array<{ key: string; query: () => Promise<T> }>): Promise<T[]> {
    const results = await Promise.allSettled(
      queries.map(({ key, query }) => this.cachedQuery(key, query))
    )
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : null
    ).filter(Boolean) as T[]
  }

  // Invalidate cache
  async invalidateCache(pattern: string): Promise<void> {
    // Clear memory cache entries matching pattern
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }

    // Clear Redis cache entries matching pattern
    try {
      const keys = await redis.keys(`*${pattern}*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.warn('Redis invalidation error:', error)
    }
  }
}

export const optimizedDB = OptimizedDB.getInstance() 