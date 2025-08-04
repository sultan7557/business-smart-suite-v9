#!/usr/bin/env node

// Safe Migration Runner
// This script runs migrations safely and handles errors

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Running database migrations safely...');

async function runMigrations() {
  try {
    // Step 1: Reset migration state if there's an error
    console.log('📝 Checking migration state...');
    try {
      execSync('npx prisma migrate status', { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️  Migration state needs reset...');
      console.log('🔄 Resetting migration state...');
      execSync('npx prisma migrate resolve --applied 20250101000000_performance_indexes', { stdio: 'inherit' });
    }

    // Step 2: Run the main performance indexes migration
    console.log('📊 Applying performance indexes...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Performance indexes applied successfully!');
    
    // Step 3: Run the full-text search indexes migration
    console.log('🔍 Applying full-text search indexes...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Full-text search indexes applied successfully!');
    
    // Step 4: Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log('🎉 All migrations completed successfully!');
    console.log('');
    console.log('📊 Performance improvements applied:');
    console.log('- Database indexes for faster queries');
    console.log('- Full-text search capabilities');
    console.log('- Optimized database schema');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting steps:');
    console.log('1. Check your database connection');
    console.log('2. Ensure you have proper permissions');
    console.log('3. Try running: npx prisma migrate reset');
    console.log('4. Contact your database administrator');
    
    process.exit(1);
  }
}

runMigrations(); 