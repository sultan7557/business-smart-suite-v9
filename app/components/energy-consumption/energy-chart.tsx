"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { ChartDataPoint, ChartConfig, CHART_COLORS } from '../../types/energy-consumption';
import { Badge } from '@/components/ui/badge';

interface EnergyChartProps {
  title: string;
  data: ChartDataPoint[];
  config: ChartConfig;
  type?: 'line' | 'bar';
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

const MONTHS_ORDER = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export default function EnergyChart({
  title,
  data,
  config,
  type = 'line',
  height = 300,
  showLegend = true,
  showGrid = true,
  className = ''
}: EnergyChartProps) {
  // Ensure months appear in fixed order on X axis
  const baseXAxisData = MONTHS_ORDER.map((m) => ({ month: m }));

  // Group data by category for different colored lines/bars
  const categories = [...new Set(data.map(item => item.category))];
  
  // Build per-category series aligned to months order
  const seriesByCategory: Record<string, { month: string; value: number }[]> = {};
  categories.forEach((cat) => {
    const byMonth = new Map<string, number>();
    data.filter(d => d.category === cat).forEach(d => byMonth.set(d.month, d.value));
    seriesByCategory[cat] = MONTHS_ORDER.map((m) => ({ month: m, value: byMonth.get(m) ?? 0 }));
  });
  
  // Create color mapping for categories
  const getCategoryColor = (category: string, index: number): string => {
    if (category.includes('Electricity')) return CHART_COLORS.electricity;
    if (category.includes('Gas')) return CHART_COLORS.gas;
    if (category.includes('Water')) return CHART_COLORS.water;
    if (category.includes('Paper')) return CHART_COLORS.paper;
    if (category.includes('Fuel')) return CHART_COLORS.fuel;
    if (category.includes('General Waste')) return CHART_COLORS.generalWaste;
    if (category.includes('Recycled Waste')) return CHART_COLORS.recycledWaste;
    if (category.includes('Scrap Metal')) return CHART_COLORS.scrapMetal;
    if (category.includes('Food Waste')) return CHART_COLORS.foodWaste;
    if (category.includes('Wood')) return CHART_COLORS.wood;
    if (category.includes('Card Bales')) return CHART_COLORS.cardBales;
    const fallbackColors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#A0522D'
    ];
    return fallbackColors[index % fallbackColors.length];
  };

  const formatTooltip = (value: any, name: string) => {
    return [`${value} ${config.unit}`, name];
  };

  const formatYAxis = (tickItem: any) => {
    return `${tickItem} ${config.unit}`;
  };

  const renderChart = () => {
    if (type === 'bar') {
      return (
        <BarChart data={baseXAxisData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDuplicatedCategory={false}
            interval={0}
            ticks={MONTHS_ORDER}
          />
          <YAxis 
            tickFormatter={formatYAxis}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip formatter={formatTooltip} />
          {showLegend && <Legend />}
          {categories.map((category, index) => (
            <Bar
              key={category}
              dataKey="value"
              name={category}
              fill={getCategoryColor(category, index)}
              data={seriesByCategory[category]}
            />
          ))}
        </BarChart>
      );
    }

    return (
      <LineChart data={baseXAxisData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          allowDuplicatedCategory={false}
          interval={0}
          ticks={MONTHS_ORDER}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip formatter={formatTooltip} />
        {showLegend && <Legend />}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey="value"
            name={category}
            data={seriesByCategory[category]}
            stroke={getCategoryColor(category, index)}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1.5 }}
            activeDot={{ r: 5, strokeWidth: 1.5 }}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {config.unit}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

