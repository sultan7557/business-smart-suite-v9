#!/usr/bin/env node

/**
 * Energy Consumption Database Setup Script
 * This script sets up the database tables and initial data for the energy consumption system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupEnergyDatabase() {
  console.log('🚀 Setting up Energy Consumption Database...\n');

  try {
    // Check if tables exist by trying to query them
    console.log('📋 Checking existing tables...');
    
    try {
      await prisma.energyBaseline.findFirst();
      console.log('✅ EnergyBaseline table already exists');
    } catch (error) {
      console.log('❌ EnergyBaseline table does not exist');
      console.log('Please run the Prisma migration first:');
      console.log('  npx prisma migrate dev --name add_energy_consumption');
      return;
    }

    try {
      await prisma.energyYear.findFirst();
      console.log('✅ EnergyYear table already exists');
    } catch (error) {
      console.log('❌ EnergyYear table does not exist');
      console.log('Please run the Prisma migration first:');
      console.log('  npx prisma migrate dev --name add_energy_consumption');
      return;
    }

    try {
      await prisma.energyMonthlyData.findFirst();
      console.log('✅ EnergyMonthlyData table already exists');
    } catch (error) {
      console.log('❌ EnergyMonthlyData table does not exist');
      console.log('Please run the Prisma migration first:');
      console.log('  npx prisma migrate dev --name add_energy_consumption');
      return;
    }

    console.log('\n🎉 All tables are ready!');
    console.log('\n📊 Next steps:');
    console.log('1. Start your Next.js application: npm run dev');
    console.log('2. Navigate to /energy-consumption');
    console.log('3. Click "Load Sample Data" to populate with demo data');
    console.log('4. Or manually enter baseline and year data');

  } catch (error) {
    console.error('❌ Error during database setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupEnergyDatabase();
}

module.exports = { setupEnergyDatabase };

