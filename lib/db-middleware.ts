import { prisma } from "@/lib/prisma"

// Database middleware for connection management
export async function withDatabaseConnection<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a connection-related error
      if (error.code === 'P1017' || error.code === 'P2024' || error.message?.includes('connection')) {
        console.warn(`Database connection attempt ${attempt} failed:`, error.message)
        
        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
      
      // If it's not a connection error, or we've exhausted retries, throw immediately
      throw error
    }
  }
  
  throw lastError
}

// Optimized query wrapper
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  try {
    return await withDatabaseConnection(queryFn)
  } catch (error) {
    console.error('Database query failed:', error)
    return fallback || null
  }
}

// Batch operations with connection pooling
export async function batchOperations<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  try {
    return await Promise.allSettled(
      operations.map(op => withDatabaseConnection(op))
    ).then(results => 
      results
        .filter((result): result is PromiseFulfilledResult<T> => result.status === 'fulfilled')
        .map(result => result.value)
    )
  } catch (error) {
    console.error('Batch operations failed:', error)
    return []
  }
}
