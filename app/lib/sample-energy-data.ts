import { EnergyData, BaselineData, YearData } from '../types/energy-consumption';

// Sample baseline data for demonstration
export const sampleBaselineData: EnergyData = {
  electricity: {
    meter1: [1250, 1180, 1100, 980, 890, 820, 850, 920, 1050, 1150, 1280, 1350],
    meter2: [850, 820, 780, 720, 680, 620, 650, 700, 780, 820, 880, 920]
  },
  gas: {
    meter1: [2100, 1950, 1800, 1500, 1200, 900, 800, 850, 1100, 1400, 1800, 2000],
    meter2: [1800, 1700, 1550, 1300, 1000, 750, 650, 700, 950, 1250, 1650, 1850]
  },
  water: {
    water1: [45, 42, 38, 35, 32, 30, 28, 30, 35, 40, 43, 46],
    water2: [38, 35, 32, 28, 25, 22, 20, 22, 26, 32, 36, 39]
  },
  paper: [120, 110, 95, 85, 75, 65, 60, 70, 85, 100, 115, 125],
  fuel: [28, 27, 26, 25, 24, 23, 22, 23, 24, 25, 26, 27],
  generalWaste: {
    waste1: [2.5, 2.3, 2.1, 1.9, 1.7, 1.5, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4],
    waste2: [1.8, 1.6, 1.4, 1.2, 1.0, 0.8, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7]
  },
  recycledWaste: {
    waste1: [1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1],
    waste2: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
  },
  scrapMetal: [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
  foodWaste: {
    waste1: [0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
    waste2: [0.4, 0.3, 0.2, 0.1, 0.1, 0.0, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5]
  },
  wood: [0.3, 0.2, 0.2, 0.1, 0.1, 0.0, 0.0, 0.1, 0.1, 0.2, 0.2, 0.3],
  cardBales: [0.5, 0.4, 0.3, 0.2, 0.2, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
};

// Sample Year 1 data showing improvement
export const sampleYear1Data: EnergyData = {
  electricity: {
    meter1: [1200, 1130, 1050, 930, 840, 780, 800, 870, 1000, 1100, 1220, 1290],
    meter2: [820, 790, 750, 690, 650, 590, 620, 670, 750, 790, 840, 880]
  },
  gas: {
    meter1: [2000, 1850, 1700, 1400, 1100, 850, 750, 800, 1050, 1350, 1750, 1950],
    meter2: [1700, 1600, 1450, 1200, 950, 700, 600, 650, 900, 1200, 1600, 1800]
  },
  water: {
    water1: [43, 40, 36, 33, 30, 28, 26, 28, 33, 38, 41, 44],
    water2: [36, 33, 30, 26, 23, 20, 18, 20, 24, 30, 34, 37]
  },
  paper: [115, 105, 90, 80, 70, 60, 55, 65, 80, 95, 110, 120],
  fuel: [29, 28, 27, 26, 25, 24, 23, 24, 25, 26, 27, 28],
  generalWaste: {
    waste1: [2.3, 2.1, 1.9, 1.7, 1.5, 1.3, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2],
    waste2: [1.6, 1.4, 1.2, 1.0, 0.8, 0.6, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5]
  },
  recycledWaste: {
    waste1: [1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2],
    waste2: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
  },
  scrapMetal: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
  foodWaste: {
    waste1: [0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
    waste2: [0.5, 0.4, 0.3, 0.2, 0.2, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
  },
  wood: [0.4, 0.3, 0.3, 0.2, 0.2, 0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4],
  cardBales: [0.6, 0.5, 0.4, 0.3, 0.3, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
};

// Sample Year 2 data showing further improvement
export const sampleYear2Data: EnergyData = {
  electricity: {
    meter1: [1150, 1080, 1000, 880, 790, 740, 750, 820, 950, 1050, 1170, 1240],
    meter2: [790, 760, 720, 660, 620, 560, 590, 640, 720, 760, 800, 840]
  },
  gas: {
    meter1: [1900, 1750, 1600, 1300, 1000, 800, 700, 750, 1000, 1300, 1700, 1900],
    meter2: [1600, 1500, 1350, 1100, 900, 650, 550, 600, 850, 1150, 1550, 1750]
  },
  water: {
    water1: [41, 38, 34, 31, 28, 26, 24, 26, 31, 36, 39, 42],
    water2: [34, 31, 28, 24, 21, 18, 16, 18, 22, 28, 32, 35]
  },
  paper: [110, 100, 85, 75, 65, 55, 50, 60, 75, 90, 105, 115],
  fuel: [30, 29, 28, 27, 26, 25, 24, 25, 26, 27, 28, 29],
  generalWaste: {
    waste1: [2.1, 1.9, 1.7, 1.5, 1.3, 1.1, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0],
    waste2: [1.4, 1.2, 1.0, 0.8, 0.6, 0.4, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3]
  },
  recycledWaste: {
    waste1: [1.4, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3],
    waste2: [1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  },
  scrapMetal: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  foodWaste: {
    waste1: [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
    waste2: [0.6, 0.5, 0.4, 0.3, 0.3, 0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
  },
  wood: [0.5, 0.4, 0.4, 0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5],
  cardBales: [0.7, 0.6, 0.5, 0.4, 0.4, 0.3, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
};

// Function to create sample baseline data object
export function createSampleBaselineData(): BaselineData {
  return {
    id: 'baseline-sample',
    ...sampleBaselineData,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };
}

// Function to create sample year data objects
export function createSampleYearData(): YearData[] {
  return [
    {
      id: 'year-1-sample',
      name: 'Year 1',
      year: 2024,
      data: sampleYear1Data,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'year-2-sample',
      name: 'Year 2',
      year: 2025,
      data: sampleYear2Data,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ];
}

// Function to populate sample data in database
export async function populateSampleData() {
  try {
    // Import database functions
    const { saveBaselineData, createYear, saveYearData } = await import('./energy-db');
    
    // Save baseline data
    const baselineResult = await saveBaselineData(sampleBaselineData);
    if (!baselineResult.success) {
      throw new Error('Failed to save baseline data');
    }
    
    // Create years and save their data
    for (const yearData of [sampleYear1Data, sampleYear2Data]) {
      const yearNumber = yearData === sampleYear1Data ? 2024 : 2025;
      const yearName = yearData === sampleYear1Data ? 'Year 1' : 'Year 2';
      
      const yearResult = await createYear(yearNumber, yearName);
      if (yearResult.success && yearResult.year) {
        await saveYearData(yearResult.year.id, yearData);
      }
    }
    
    console.log('Sample data populated successfully in database');
    return true;
  } catch (error) {
    console.error('Error populating sample data:', error);
    return false;
  }
}

// Function to clear all data from database
export async function clearAllData() {
  try {
    // Import database functions
    const { deleteYear } = await import('./energy-db');
    
    // Note: This would require additional database functions to clear all data
    // For now, we'll just log that this function needs to be implemented
    console.log('Clear all data function needs to be implemented for database');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
