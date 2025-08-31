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

export interface YearData {
  id: string;
  name: string;
  year: number;
  data: EnergyData;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaselineData extends EnergyData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyConsumptionState {
  baseline: BaselineData | null;
  years: YearData[];
  isLoading: boolean;
  error: string | null;
}

export type Month = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 
                   'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC';

export const MONTHS: Month[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export interface ChartDataPoint {
  month: Month;
  value: number;
  category: string;
  year?: string;
}

export interface ChartConfig {
  title: string;
  dataKey: string;
  color: string;
  unit: string;
  yAxisLabel: string;
}

export const CHART_COLORS = {
  electricity: '#3B82F6',
  gas: '#EF4444',
  water: '#06B6D4',
  paper: '#8B5CF6',
  fuel: '#F59E0B',
  generalWaste: '#6B7280',
  recycledWaste: '#10B981',
  scrapMetal: '#F97316',
  foodWaste: '#EC4899',
  wood: '#A0522D',
  cardBales: '#84CC16',
} as const;

export const CHART_CONFIGS: Record<string, ChartConfig> = {
  energyBaseline: {
    title: 'Energy Baseline (Electricity & Gas)',
    dataKey: 'value',
    color: CHART_COLORS.electricity,
    unit: 'kWh',
    yAxisLabel: 'Energy Consumption (kWh)',
  },
  energyConsumption: {
    title: 'Energy Consumption (Electricity & Gas)',
    dataKey: 'value',
    color: CHART_COLORS.gas,
    unit: 'kWh',
    yAxisLabel: 'Energy Consumption (kWh)',
  },
  waterUsage: {
    title: 'Water Usage',
    dataKey: 'value',
    color: CHART_COLORS.water,
    unit: 'm³',
    yAxisLabel: 'Water Consumption (m³)',
  },
  fuelUsage: {
    title: 'Fuel Usage',
    dataKey: 'value',
    color: CHART_COLORS.fuel,
    unit: 'mpg',
    yAxisLabel: 'Fuel Efficiency (mpg)',
  },
  wasteAnalysis: {
    title: 'Waste Analysis',
    dataKey: 'value',
    color: CHART_COLORS.generalWaste,
    unit: 'tonnes',
    yAxisLabel: 'Waste (tonnes)',
  },
  paperUsage: {
    title: 'Paper Usage',
    dataKey: 'value',
    color: CHART_COLORS.paper,
    unit: 'reams',
    yAxisLabel: 'Paper Consumption (reams)',
  },
  scrapMetal: {
    title: 'Scrap Metal',
    dataKey: 'value',
    color: CHART_COLORS.scrapMetal,
    unit: 'tonnes',
    yAxisLabel: 'Scrap Metal (tonnes)',
  },
  foodWaste: {
    title: 'Food Waste Analysis',
    dataKey: 'value',
    color: CHART_COLORS.foodWaste,
    unit: 'tonnes',
    yAxisLabel: 'Food Waste (tonnes)',
  },
  wood: {
    title: 'Wood Waste',
    dataKey: 'value',
    color: CHART_COLORS.wood,
    unit: 'tonnes',
    yAxisLabel: 'Wood Waste (tonnes)',
  },
  cardBales: {
    title: 'Card Bales Waste',
    dataKey: 'value',
    color: CHART_COLORS.cardBales,
    unit: 'tonnes',
    yAxisLabel: 'Card Bales (tonnes)',
  },
};

