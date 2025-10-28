// Example usage of the optimized database connection
// This file shows how to use the new connection management

import { prisma } from "@/lib/prisma"
import { withDatabaseConnection, safeQuery, batchOperations } from "@/lib/db-middleware"

// Example 1: Basic usage with connection management
export async function getUsers() {
  return await withDatabaseConnection(async () => {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    })
  })
}

// Example 2: Safe query with fallback
export async function getUserById(id: string) {
  return await safeQuery(
    () => prisma.user.findUnique({ where: { id } }),
    null // fallback value
  )
}

// Example 3: Batch operations
export async function getMultipleData() {
  return await batchOperations([
    () => prisma.user.count(),
    () => prisma.manual.count(),
    () => prisma.category.count()
  ])
}

// Example 4: Direct usage (for simple operations)
export async function simpleQuery() {
  try {
    return await prisma.user.findMany()
  } catch (error) {
    console.error('Query failed:', error)
    return []
  }
}
