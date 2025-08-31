import { EnergyData, YearData, BaselineData, Month, MONTHS, ChartDataPoint } from '../types/energy-consumption';

export function createEmptyEnergyData(): EnergyData {
  return {
    electricity: { meter1: new Array(12).fill(0), meter2: new Array(12).fill(0) },
    gas: { meter1: new Array(12).fill(0), meter2: new Array(12).fill(0) },
    water: { water1: new Array(12).fill(0), water2: new Array(12).fill(0) },
    paper: new Array(12).fill(0),
    fuel: new Array(12).fill(0),
    generalWaste: { waste1: new Array(12).fill(0), waste2: new Array(12).fill(0) },
    recycledWaste: { waste1: new Array(12).fill(0), waste2: new Array(12).fill(0) },
    scrapMetal: new Array(12).fill(0),
    foodWaste: { waste1: new Array(12).fill(0), waste2: new Array(12).fill(0) },
    wood: new Array(12).fill(0),
    cardBales: new Array(12).fill(0),
  };
}

export function generateChartData(
  data: EnergyData,
  yearName: string,
  includeBaseline: boolean = false,
  baselineData?: EnergyData
): Record<string, ChartDataPoint[]> {
  const charts: Record<string, ChartDataPoint[]> = {};

  // Energy Baseline (Electricity & Gas)
  charts.energyBaseline = [];
  MONTHS.forEach((month, index) => {
    charts.energyBaseline.push(
      { month, value: data.electricity.meter1[index], category: 'Electricity Meter 1', year: yearName },
      { month, value: data.electricity.meter2[index], category: 'Electricity Meter 2', year: yearName },
      { month, value: data.gas.meter1[index], category: 'Gas Meter 1', year: yearName },
      { month, value: data.gas.meter2[index], category: 'Gas Meter 2', year: yearName }
    );
  });

  // Energy Consumption (Electricity & Gas)
  charts.energyConsumption = [];
  MONTHS.forEach((month, index) => {
    charts.energyConsumption.push(
      { month, value: data.electricity.meter1[index], category: 'Electricity Meter 1', year: yearName },
      { month, value: data.electricity.meter2[index], category: 'Electricity Meter 2', year: yearName },
      { month, value: data.gas.meter1[index], category: 'Gas Meter 1', year: yearName },
      { month, value: data.gas.meter2[index], category: 'Gas Meter 2', year: yearName }
    );
  });

  // Water Usage
  charts.waterUsage = [];
  MONTHS.forEach((month, index) => {
    charts.waterUsage.push(
      { month, value: data.water.water1[index], category: 'Water 1', year: yearName },
      { month, value: data.water.water2[index], category: 'Water 2', year: yearName }
    );
  });

  // Fuel Usage
  charts.fuelUsage = [];
  MONTHS.forEach((month, index) => {
    charts.fuelUsage.push(
      { month, value: data.fuel[index], category: 'Fuel (mpg)', year: yearName }
    );
  });

  // Waste Analysis
  charts.wasteAnalysis = [];
  MONTHS.forEach((month, index) => {
    charts.wasteAnalysis.push(
      { month, value: data.generalWaste.waste1[index], category: 'General Waste 1', year: yearName },
      { month, value: data.generalWaste.waste2[index], category: 'General Waste 2', year: yearName },
      { month, value: data.recycledWaste.waste1[index], category: 'Recycled Waste 1', year: yearName },
      { month, value: data.recycledWaste.waste2[index], category: 'Recycled Waste 2', year: yearName }
    );
  });

  // Paper Usage
  charts.paperUsage = [];
  MONTHS.forEach((month, index) => {
    charts.paperUsage.push(
      { month, value: data.paper[index], category: 'Paper (reams)', year: yearName }
    );
  });

  // Scrap Metal
  charts.scrapMetal = [];
  MONTHS.forEach((month, index) => {
    charts.scrapMetal.push(
      { month, value: data.scrapMetal[index], category: 'Scrap Metal', year: yearName }
    );
  });

  // Food Waste Analysis
  charts.foodWaste = [];
  MONTHS.forEach((month, index) => {
    charts.foodWaste.push(
      { month, value: data.foodWaste.waste1[index], category: 'Food Waste 1', year: yearName },
      { month, value: data.foodWaste.waste2[index], category: 'Food Waste 2', year: yearName }
    );
  });

  // Wood Waste
  charts.wood = [];
  MONTHS.forEach((month, index) => {
    charts.wood.push(
      { month, value: data.wood[index], category: 'Wood', year: yearName }
    );
  });

  // Card Bales Waste
  charts.cardBales = [];
  MONTHS.forEach((month, index) => {
    charts.cardBales.push(
      { month, value: data.cardBales[index], category: 'Card Bales', year: yearName }
    );
  });

  // Baseline vs Current Year comparison (only for year sheets)
  if (includeBaseline && baselineData) {
    charts.baselineComparison = [];
    MONTHS.forEach((month, index) => {
      // Current year data
      charts.baselineComparison.push(
        { month, value: data.electricity.meter1[index], category: `${yearName} - Electricity Meter 1`, year: yearName },
        { month, value: data.electricity.meter2[index], category: `${yearName} - Electricity Meter 2`, year: yearName },
        { month, value: data.gas.meter1[index], category: `${yearName} - Gas Meter 1`, year: yearName },
        { month, value: data.gas.meter2[index], category: `${yearName} - Gas Meter 2`, year: yearName }
      );
      // Baseline data
      charts.baselineComparison.push(
        { month, value: baselineData.electricity.meter1[index], category: 'Baseline - Electricity Meter 1', year: 'Baseline' },
        { month, value: baselineData.electricity.meter2[index], category: 'Baseline - Electricity Meter 2', year: 'Baseline' },
        { month, value: baselineData.gas.meter1[index], category: 'Baseline - Gas Meter 1', year: 'Baseline' },
        { month, value: baselineData.gas.meter2[index], category: 'Baseline - Gas Meter 2', year: 'Baseline' }
      );
    });
  }

  return charts;
}

export function calculateYearlyTotals(data: EnergyData): Record<string, number> {
  const totals: Record<string, number> = {};

  // Electricity totals
  totals.electricityMeter1 = data.electricity.meter1.reduce((sum, val) => sum + val, 0);
  totals.electricityMeter2 = data.electricity.meter2.reduce((sum, val) => sum + val, 0);
  totals.electricityTotal = totals.electricityMeter1 + totals.electricityMeter2;

  // Gas totals
  totals.gasMeter1 = data.gas.meter1.reduce((sum, val) => sum + val, 0);
  totals.gasMeter2 = data.gas.meter2.reduce((sum, val) => sum + val, 0);
  totals.gasTotal = totals.gasMeter1 + totals.gasMeter2;

  // Water totals
  totals.water1 = data.water.water1.reduce((sum, val) => sum + val, 0);
  totals.water2 = data.water.water2.reduce((sum, val) => sum + val, 0);
  totals.waterTotal = totals.water1 + totals.water2;

  // Other totals
  totals.paper = data.paper.reduce((sum, val) => sum + val, 0);
  totals.fuel = data.fuel.reduce((sum, val) => sum + val, 0);
  totals.generalWaste = data.generalWaste.waste1.reduce((sum, val) => sum + val, 0) + 
                        data.generalWaste.waste2.reduce((sum, val) => sum + val, 0);
  totals.recycledWaste = data.recycledWaste.waste1.reduce((sum, val) => sum + val, 0) + 
                         data.recycledWaste.waste2.reduce((sum, val) => sum + val, 0);
  totals.scrapMetal = data.scrapMetal.reduce((sum, val) => sum + val, 0);
  totals.foodWaste = data.foodWaste.waste1.reduce((sum, val) => sum + val, 0) + 
                     data.foodWaste.waste2.reduce((sum, val) => sum + val, 0);
  totals.wood = data.wood.reduce((sum, val) => sum + val, 0);
  totals.cardBales = data.cardBales.reduce((sum, val) => sum + val, 0);

  return totals;
}

export function calculatePercentageChange(current: number, baseline: number): number {
  if (baseline === 0) return current === 0 ? 0 : 100;
  return ((current - baseline) / baseline) * 100;
}

export function validateEnergyData(data: EnergyData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if all arrays have exactly 12 months
  const expectedLength = 12;
  
  if (data.electricity.meter1.length !== expectedLength) errors.push('Electricity Meter 1 must have 12 months of data');
  if (data.electricity.meter2.length !== expectedLength) errors.push('Electricity Meter 2 must have 12 months of data');
  if (data.gas.meter1.length !== expectedLength) errors.push('Gas Meter 1 must have 12 months of data');
  if (data.gas.meter2.length !== expectedLength) errors.push('Gas Meter 2 must have 12 months of data');
  if (data.water.water1.length !== expectedLength) errors.push('Water 1 must have 12 months of data');
  if (data.water.water2.length !== expectedLength) errors.push('Water 2 must have 12 months of data');
  if (data.paper.length !== expectedLength) errors.push('Paper must have 12 months of data');
  if (data.fuel.length !== expectedLength) errors.push('Fuel must have 12 months of data');
  if (data.generalWaste.waste1.length !== expectedLength) errors.push('General Waste 1 must have 12 months of data');
  if (data.generalWaste.waste2.length !== expectedLength) errors.push('General Waste 2 must have 12 months of data');
  if (data.recycledWaste.waste1.length !== expectedLength) errors.push('Recycled Waste 1 must have 12 months of data');
  if (data.recycledWaste.waste2.length !== expectedLength) errors.push('Recycled Waste 2 must have 12 months of data');
  if (data.scrapMetal.length !== expectedLength) errors.push('Scrap Metal must have 12 months of data');
  if (data.foodWaste.waste1.length !== expectedLength) errors.push('Food Waste 1 must have 12 months of data');
  if (data.foodWaste.waste2.length !== expectedLength) errors.push('Food Waste 2 must have 12 months of data');
  if (data.wood.length !== expectedLength) errors.push('Wood must have 12 months of data');
  if (data.cardBales.length !== expectedLength) errors.push('Card Bales must have 12 months of data');

  // Check for negative values (except fuel which can be negative for efficiency)
  const checkNegative = (values: number[], name: string) => {
    values.forEach((value, index) => {
      if (value < 0 && name !== 'Fuel') {
        errors.push(`${name} month ${index + 1} cannot be negative`);
      }
    });
  };

  checkNegative(data.electricity.meter1, 'Electricity Meter 1');
  checkNegative(data.electricity.meter2, 'Electricity Meter 2');
  checkNegative(data.gas.meter1, 'Gas Meter 1');
  checkNegative(data.gas.meter2, 'Gas Meter 2');
  checkNegative(data.water.water1, 'Water 1');
  checkNegative(data.water.water2, 'Water 2');
  checkNegative(data.paper, 'Paper');
  checkNegative(data.fuel, 'Fuel');
  checkNegative(data.generalWaste.waste1, 'General Waste 1');
  checkNegative(data.generalWaste.waste2, 'General Waste 2');
  checkNegative(data.recycledWaste.waste1, 'Recycled Waste 1');
  checkNegative(data.recycledWaste.waste2, 'Recycled Waste 2');
  checkNegative(data.scrapMetal, 'Scrap Metal');
  checkNegative(data.foodWaste.waste1, 'Food Waste 1');
  checkNegative(data.foodWaste.waste2, 'Food Waste 2');
  checkNegative(data.wood, 'Wood');
  checkNegative(data.cardBales, 'Card Bales');

  return { isValid: errors.length === 0, errors };
}

export function exportToExcel(
  baselineData: BaselineData | null,
  yearsData: YearData[]
): void {
  // This would integrate with the xlsx library to export data
  // Implementation depends on the specific export requirements
  console.log('Export functionality would be implemented here');
}

