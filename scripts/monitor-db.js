#!/usr/bin/env node

// Database connection monitoring script
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function monitorDatabase() {
  console.log('🔍 Monitoring database connection...')
  
  try {
    // Test basic connection
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const duration = Date.now() - start
    
    console.log(`✅ Database connection: ${duration}ms`)
    
    // Test connection pool
    const poolTest = await Promise.all([
      prisma.$queryRaw`SELECT 1 as test1`,
      prisma.$queryRaw`SELECT 2 as test2`,
      prisma.$queryRaw`SELECT 3 as test3`,
    ])
    
    console.log('✅ Connection pool test passed')
    
    // Get connection info
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        state,
        application_name
      FROM pg_stat_activity 
      WHERE state = 'active'
      GROUP BY state, application_name
    `
    
    console.log('📊 Active connections:', connectionInfo)
    
  } catch (error) {
    console.error('❌ Database monitoring failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run monitoring
monitorDatabase().catch(console.error)
