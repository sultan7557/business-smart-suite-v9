import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface EnergyData {
  electricity: {
    meter1: number[];
    meter2: number[];
  };
  gas: {
    meter1: number[];
    meter2: number[];
  };
  water: {
    water1: number[];
    water2: number[];
  };
  paper: number[];
  fuel: number[];
  generalWaste: {
    waste1: number[];
    waste2: number[];
  };
  recycledWaste: {
    waste1: number[];
    waste2: number[];
  };
  scrapMetal: number[];
  foodWaste: {
    waste1: number[];
    waste2: number[];
  };
  wood: number[];
  cardBales: number[];
}

export interface BaselineData extends EnergyData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface YearData {
  id: string;
  name: string;
  year: number;
  data: EnergyData;
  createdAt: Date;
  updatedAt: Date;
}

// Convert EnergyData to database format
export function convertEnergyDataToDB(data: EnergyData, year: number, month: number) {
  return {
    year,
    month,
    electricityMeter1: data.electricity.meter1[month - 1] || 0,
    electricityMeter2: data.electricity.meter2[month - 1] || 0,
    gasMeter1: data.gas.meter1[month - 1] || 0,
    gasMeter2: data.gas.meter2[month - 1] || 0,
    water1: data.water.water1[month - 1] || 0,
    water2: data.water.water2[month - 1] || 0,
    paper: data.paper[month - 1] || 0,
    fuel: data.fuel[month - 1] || 0,
    generalWaste1: data.generalWaste.waste1[month - 1] || 0,
    generalWaste2: data.generalWaste.waste2[month - 1] || 0,
    recycledWaste1: data.recycledWaste.waste1[month - 1] || 0,
    recycledWaste2: data.recycledWaste.waste2[month - 1] || 0,
    scrapMetal: data.scrapMetal[month - 1] || 0,
    foodWaste1: data.foodWaste.waste1[month - 1] || 0,
    foodWaste2: data.foodWaste.waste2[month - 1] || 0,
    wood: data.wood[month - 1] || 0,
    cardBales: data.cardBales[month - 1] || 0,
  };
}

// Convert database format to EnergyData
export function convertDBToEnergyData(dbData: any[]): EnergyData {
  const data: EnergyData = {
    electricity: { meter1: [], meter2: [] },
    gas: { meter1: [], meter2: [] },
    water: { water1: [], water2: [] },
    paper: [],
    fuel: [],
    generalWaste: { waste1: [], waste2: [] },
    recycledWaste: { waste1: [], waste2: [] },
    scrapMetal: [],
    foodWaste: { waste1: [], waste2: [] },
    wood: [],
    cardBales: [],
  };

  // Sort by month and populate arrays
  const sortedData = dbData.sort((a, b) => a.month - b.month);
  
  sortedData.forEach((item) => {
    data.electricity.meter1.push(item.electricityMeter1);
    data.electricity.meter2.push(item.electricityMeter2);
    data.gas.meter1.push(item.gasMeter1);
    data.gas.meter2.push(item.gasMeter2);
    data.water.water1.push(item.water1);
    data.water.water2.push(item.water2);
    data.paper.push(item.paper);
    data.fuel.push(item.fuel);
    data.generalWaste.waste1.push(item.generalWaste1);
    data.generalWaste.waste2.push(item.generalWaste2);
    data.recycledWaste.waste1.push(item.recycledWaste1);
    data.recycledWaste.waste2.push(item.recycledWaste2);
    data.scrapMetal.push(item.scrapMetal);
    data.foodWaste.waste1.push(item.foodWaste1);
    data.foodWaste.waste2.push(item.foodWaste2);
    data.wood.push(item.wood);
    data.cardBales.push(item.cardBales);
  });

  return data;
}

// Database operations
export async function saveBaselineData(data: EnergyData, organizationId: string = 'default') {
  try {
    // Delete existing baseline data for the organization
    await prisma.energyBaseline.deleteMany({
      where: { organizationId }
    });

    // Insert new baseline data for all 12 months
    const baselineData = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = convertEnergyDataToDB(data, 0, month); // year 0 for baseline
      baselineData.push({
        ...monthData,
        organizationId,
      });
    }

    await prisma.energyBaseline.createMany({
      data: baselineData
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving baseline data:', error);
    return { success: false, error };
  }
}

export async function saveYearData(yearId: string, data: EnergyData, organizationId: string = 'default') {
  try {
    // Delete existing monthly data for this year
    await prisma.energyMonthlyData.deleteMany({
      where: { energyYearId: yearId }
    });

    // Insert new monthly data for all 12 months
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = convertEnergyDataToDB(data, 0, month);
      monthlyData.push({
        ...monthData,
        energyYearId: yearId,
      });
    }

    await prisma.energyMonthlyData.createMany({
      data: monthlyData
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving year data:', error);
    return { success: false, error };
  }
}

export async function createYear(year: number, name: string, organizationId: string = 'default') {
  try {
    const newYear = await prisma.energyYear.create({
      data: {
        year,
        name,
        organizationId,
      }
    });

    return { success: true, year: newYear };
  } catch (error) {
    console.error('Error creating year:', error);
    return { success: false, error };
  }
}

export async function deleteYear(yearId: string) {
  try {
    // Delete monthly data first
    await prisma.energyMonthlyData.deleteMany({
      where: { energyYearId: yearId }
    });

    // Delete the year
    await prisma.energyYear.delete({
      where: { id: yearId }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting year:', error);
    return { success: false, error };
  }
}

export async function getBaselineData(organizationId: string = 'default'): Promise<BaselineData | null> {
  try {
    const baselineData = await prisma.energyBaseline.findMany({
      where: { organizationId },
      orderBy: { month: 'asc' }
    });

    if (baselineData.length === 0) return null;

    const data = convertDBToEnergyData(baselineData);
    return {
      id: 'baseline',
      ...data,
      createdAt: baselineData[0].createdAt,
      updatedAt: baselineData[0].updatedAt,
    };
  } catch (error) {
    console.error('Error getting baseline data:', error);
    return null;
  }
}

export async function getYearData(yearId: string): Promise<YearData | null> {
  try {
    const year = await prisma.energyYear.findUnique({
      where: { id: yearId },
      include: { monthlyData: true }
    });

    if (!year) return null;

    const data = convertDBToEnergyData(year.monthlyData);
    return {
      id: year.id,
      name: year.name,
      year: year.year,
      data,
      createdAt: year.createdAt,
      updatedAt: year.updatedAt,
    };
  } catch (error) {
    console.error('Error getting year data:', error);
    return null;
  }
}

export async function getAllYears(organizationId: string = 'default'): Promise<YearData[]> {
  try {
    const years = await prisma.energyYear.findMany({
      where: { organizationId, isActive: true },
      orderBy: { year: 'asc' },
      include: { monthlyData: true }
    });

    return years.map(year => {
      const data = convertDBToEnergyData(year.monthlyData);
      return {
        id: year.id,
        name: year.name,
        year: year.year,
        data,
        createdAt: year.createdAt,
        updatedAt: year.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error getting all years:', error);
    return [];
  }
}

