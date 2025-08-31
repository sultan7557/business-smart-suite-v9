-- Create Energy Consumption Tables
-- This migration adds the energy consumption tracking system

-- Create EnergyBaseline table
CREATE TABLE "EnergyBaseline" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "electricityMeter1" DOUBLE PRECISION NOT NULL,
    "electricityMeter2" DOUBLE PRECISION NOT NULL,
    "gasMeter1" DOUBLE PRECISION NOT NULL,
    "gasMeter2" DOUBLE PRECISION NOT NULL,
    "water1" DOUBLE PRECISION NOT NULL,
    "water2" DOUBLE PRECISION NOT NULL,
    "paper" DOUBLE PRECISION NOT NULL,
    "fuel" DOUBLE PRECISION NOT NULL,
    "generalWaste1" DOUBLE PRECISION NOT NULL,
    "generalWaste2" DOUBLE PRECISION NOT NULL,
    "recycledWaste1" DOUBLE PRECISION NOT NULL,
    "recycledWaste2" DOUBLE PRECISION NOT NULL,
    "scrapMetal" DOUBLE PRECISION NOT NULL,
    "foodWaste1" DOUBLE PRECISION NOT NULL,
    "foodWaste2" DOUBLE PRECISION NOT NULL,
    "wood" DOUBLE PRECISION NOT NULL,
    "cardBales" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyBaseline_pkey" PRIMARY KEY ("id")
);

-- Create EnergyYear table
CREATE TABLE "EnergyYear" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyYear_pkey" PRIMARY KEY ("id")
);

-- Create EnergyMonthlyData table
CREATE TABLE "EnergyMonthlyData" (
    "id" TEXT NOT NULL,
    "energyYearId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "electricityMeter1" DOUBLE PRECISION NOT NULL,
    "electricityMeter2" DOUBLE PRECISION NOT NULL,
    "gasMeter1" DOUBLE PRECISION NOT NULL,
    "gasMeter2" DOUBLE PRECISION NOT NULL,
    "water1" DOUBLE PRECISION NOT NULL,
    "water2" DOUBLE PRECISION NOT NULL,
    "paper" DOUBLE PRECISION NOT NULL,
    "fuel" DOUBLE PRECISION NOT NULL,
    "generalWaste1" DOUBLE PRECISION NOT NULL,
    "generalWaste2" DOUBLE PRECISION NOT NULL,
    "recycledWaste1" DOUBLE PRECISION NOT NULL,
    "recycledWaste2" DOUBLE PRECISION NOT NULL,
    "scrapMetal" DOUBLE PRECISION NOT NULL,
    "foodWaste1" DOUBLE PRECISION NOT NULL,
    "foodWaste2" DOUBLE PRECISION NOT NULL,
    "wood" DOUBLE PRECISION NOT NULL,
    "cardBales" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyMonthlyData_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "EnergyBaseline_organizationId_year_month_key" ON "EnergyBaseline"("organizationId", "year", "month");
CREATE UNIQUE INDEX "EnergyYear_organizationId_year_key" ON "EnergyYear"("organizationId", "year");
CREATE UNIQUE INDEX "EnergyMonthlyData_energyYearId_month_key" ON "EnergyMonthlyData"("energyYearId", "month");

-- Create foreign key constraints
ALTER TABLE "EnergyMonthlyData" ADD CONSTRAINT "EnergyMonthlyData_energyYearId_fkey" FOREIGN KEY ("energyYearId") REFERENCES "EnergyYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "EnergyBaseline_organizationId_idx" ON "EnergyBaseline"("organizationId");
CREATE INDEX "EnergyYear_organizationId_idx" ON "EnergyYear"("organizationId");
CREATE INDEX "EnergyMonthlyData_energyYearId_idx" ON "EnergyMonthlyData"("energyYearId");

