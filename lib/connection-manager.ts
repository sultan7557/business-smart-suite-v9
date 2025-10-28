import { PrismaClient } from "@prisma/client"

// Connection pool manager for production stability
class ConnectionManager {
  private static instance: ConnectionManager
  private prisma: PrismaClient
  private isConnected = false
  private connectionAttempts = 0
  private maxRetries = 3

  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  async getConnection(): Promise<PrismaClient> {
    if (!this.isConnected) {
      await this.ensureConnection()
    }
    return this.prisma
  }

  private async ensureConnection(): Promise<void> {
    try {
      await this.prisma.$connect()
      this.isConnected = true
      this.connectionAttempts = 0
    } catch (error) {
      this.connectionAttempts++
      this.isConnected = false
      
      if (this.connectionAttempts >= this.maxRetries) {
        console.error('Max connection retries reached. Database may be unavailable.')
        throw error
      }
      
      // Exponential backoff
      const delay = Math.pow(2, this.connectionAttempts) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return this.ensureConnection()
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      this.isConnected = false
    } catch (error) {
      console.error('Error disconnecting from database:', error)
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }
}

// Global connection manager instance
const connectionManager = ConnectionManager.getInstance()

// Export the managed Prisma client
export const prisma = connectionManager.getConnection()

// Graceful shutdown
process.on('beforeExit', async () => {
  await connectionManager.disconnect()
})

process.on('SIGINT', async () => {
  await connectionManager.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await connectionManager.disconnect()
  process.exit(0)
})

export default prisma
