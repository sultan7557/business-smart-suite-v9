"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Settings,
  Calendar,
  Zap,
  Droplets,
  FileText,
  Fuel,
  Trash2,
  Recycle,
  Scissors,
  Apple,
  TreePine,
  Package
} from 'lucide-react';
import { 
  EnergyData, 
  YearData, 
  BaselineData, 
  CHART_CONFIGS 
} from '../../types/energy-consumption';
import { 
  generateChartData, 
  calculateYearlyTotals, 
  calculatePercentageChange 
} from '../../lib/energy-consumption-utils';
import EnergyChart from './energy-chart';
import DataEntryForm from './data-entry-form';

interface EnergyDashboardProps {
  baselineData: BaselineData | null;
  yearsData: YearData[];
  onSaveBaseline: (data: EnergyData) => Promise<void>;
  onSaveYear: (yearId: string, data: EnergyData) => Promise<void>;
  onAddYear: (year: number) => Promise<void>;
  onDeleteYear: (yearId: string) => Promise<void>;
}

export default function EnergyDashboard({
  baselineData,
  yearsData,
  onSaveBaseline,
  onSaveYear,
  onAddYear,
  onDeleteYear
}: EnergyDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBaselineForm, setShowBaselineForm] = useState(false);
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [showAddYearDialog, setShowAddYearDialog] = useState(false);
  const [newYearNumber, setNewYearNumber] = useState<number>(0);

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const handleAddYear = async () => {
    if (newYearNumber > 0) {
      await onAddYear(newYearNumber);
      setShowAddYearDialog(false);
      setNewYearNumber(0);
    }
  };

  const handleSaveBaseline = async (data: EnergyData) => {
    await onSaveBaseline(data);
    setShowBaselineForm(false);
  };

  const handleSaveYear = async (data: EnergyData) => {
    if (editingYear) {
      await onSaveYear(editingYear, data);
      setEditingYear(null);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Energy (kWh)</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {baselineData ? 
                calculateYearlyTotals(baselineData).electricityTotal + 
                calculateYearlyTotals(baselineData).gasTotal : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseline Year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Usage (m³)</CardTitle>
            <Droplets className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {baselineData ? calculateYearlyTotals(baselineData).waterTotal : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseline Year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste (tonnes)</CardTitle>
            <Trash2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {baselineData ? 
                calculateYearlyTotals(baselineData).generalWaste + 
                calculateYearlyTotals(baselineData).recycledWaste : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseline Year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Years Tracked</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {yearsData.length + (baselineData ? 1 : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total Periods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Year Comparison */}
      {yearsData.length > 0 && baselineData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Year-over-Year Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yearsData.map((year) => {
                const yearTotals = calculateYearlyTotals(year.data);
                const baselineTotals = calculateYearlyTotals(baselineData);
                const energyChange = calculatePercentageChange(
                  yearTotals.electricityTotal + yearTotals.gasTotal,
                  baselineTotals.electricityTotal + baselineTotals.gasTotal
                );
                
                return (
                  <div key={year.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{year.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Energy: {yearTotals.electricityTotal + yearTotals.gasTotal} kWh
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        energyChange > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {energyChange > 0 ? '+' : ''}{energyChange.toFixed(1)}%
                      </span>
                      <Badge variant={energyChange > 0 ? 'destructive' : 'default'}>
                        {energyChange > 0 ? 'Increase' : 'Decrease'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!baselineData && (
            <Button onClick={() => setShowBaselineForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Set Baseline Data
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowAddYearDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Year
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderChartsTab = () => {
    if (!baselineData) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Baseline Data</h3>
          <p className="text-muted-foreground mb-4">
            Set baseline data to view charts and analytics
          </p>
          <Button onClick={() => setShowBaselineForm(true)}>
            Set Baseline Data
          </Button>
        </div>
      );
    }

    const baselineCharts = generateChartData(baselineData, 'Baseline');

    return (
      <div className="space-y-6">
        {/* Baseline Charts */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Baseline Charts</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyChart
              title="Energy Baseline (Electricity & Gas)"
              data={baselineCharts.energyBaseline}
              config={CHART_CONFIGS.energyBaseline}
            />
            <EnergyChart
              title="Water Usage"
              data={baselineCharts.waterUsage}
              config={CHART_CONFIGS.waterUsage}
            />
            <EnergyChart
              title="Fuel Usage"
              data={baselineCharts.fuelUsage}
              config={CHART_CONFIGS.fuelUsage}
            />
            <EnergyChart
              title="Waste Analysis"
              data={baselineCharts.wasteAnalysis}
              config={CHART_CONFIGS.wasteAnalysis}
            />
            <EnergyChart
              title="Paper Usage"
              data={baselineCharts.paperUsage}
              config={CHART_CONFIGS.paperUsage}
            />
            <EnergyChart
              title="Scrap Metal"
              data={baselineCharts.scrapMetal}
              config={CHART_CONFIGS.scrapMetal}
            />
            <EnergyChart
              title="Food Waste Analysis"
              data={baselineCharts.foodWaste}
              config={CHART_CONFIGS.foodWaste}
            />
            <EnergyChart
              title="Wood Waste"
              data={baselineCharts.wood}
              config={CHART_CONFIGS.wood}
            />
            <EnergyChart
              title="Card Bales Waste"
              data={baselineCharts.cardBales}
              config={CHART_CONFIGS.cardBales}
            />
          </div>
        </div>

        {/* Year Charts */}
        {yearsData.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Year Comparison Charts</h3>
            {yearsData.map((year) => {
              const yearCharts = generateChartData(year.data, year.name, true, baselineData);
              
              return (
                <div key={year.id} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-2xl font-bold text-gray-900">{year.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingYear(year.id)}
                      >
                        Edit Data
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteYear(year.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  {/* All 10 Baseline Charts for this Year */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <EnergyChart
                      title="Energy Baseline (Electricity & Gas)"
                      data={yearCharts.energyBaseline}
                      config={CHART_CONFIGS.energyBaseline}
                    />
                    <EnergyChart
                      title="Water Usage"
                      data={yearCharts.waterUsage}
                      config={CHART_CONFIGS.waterUsage}
                    />
                    <EnergyChart
                      title="Fuel Usage"
                      data={yearCharts.fuelUsage}
                      config={CHART_CONFIGS.fuelUsage}
                    />
                    <EnergyChart
                      title="Waste Analysis"
                      data={yearCharts.wasteAnalysis}
                      config={CHART_CONFIGS.wasteAnalysis}
                    />
                    <EnergyChart
                      title="Paper Usage"
                      data={yearCharts.paperUsage}
                      config={CHART_CONFIGS.paperUsage}
                    />
                    <EnergyChart
                      title="Scrap Metal"
                      data={yearCharts.scrapMetal}
                      config={CHART_CONFIGS.scrapMetal}
                    />
                    <EnergyChart
                      title="Food Waste Analysis"
                      data={yearCharts.foodWaste}
                      config={CHART_CONFIGS.foodWaste}
                    />
                    <EnergyChart
                      title="Wood Waste"
                      data={yearCharts.wood}
                      config={CHART_CONFIGS.wood}
                    />
                    <EnergyChart
                      title="Card Bales Waste"
                      data={yearCharts.cardBales}
                      config={CHART_CONFIGS.cardBales}
                    />
                    <EnergyChart
                      title="Energy Consumption (Electricity & Gas)"
                      data={yearCharts.energyConsumption}
                      config={CHART_CONFIGS.energyConsumption}
                    />
                  </div>
                  
                  {/* Baseline Comparison Chart */}
                  <div className="mb-8">
                    <h5 className="text-lg font-semibold mb-4 text-gray-800">Baseline Comparison</h5>
                    <EnergyChart
                      title="Baseline vs Current Year (Electricity & Gas)"
                      data={yearCharts.baselineComparison}
                      config={CHART_CONFIGS.energyBaseline}
                      height={400}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Baseline Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Baseline Data</CardTitle>
            {baselineData ? (
              <Button variant="outline" onClick={() => setShowBaselineForm(true)}>
                Edit Baseline
              </Button>
            ) : (
              <Button onClick={() => setShowBaselineForm(true)}>
                Set Baseline Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {baselineData ? (
            <div className="text-sm text-muted-foreground">
              Baseline data set on {new Date(baselineData.createdAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No baseline data set. Set baseline data to start tracking energy consumption.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Year Data</CardTitle>
            <Button variant="outline" onClick={() => setShowAddYearDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Year
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {yearsData.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No year data added yet. Add a year to start tracking.
            </div>
          ) : (
            <div className="space-y-2">
              {yearsData.map((year) => (
                <div key={year.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{year.name}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(year.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingYear(year.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteYear(year.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Energy Consumption Dashboard</h1>
          <p className="text-muted-foreground">
            Track and analyze your organization's energy consumption and environmental impact
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="charts" className="mt-6">
          {renderChartsTab()}
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          {renderDataTab()}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showBaselineForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <DataEntryForm
              initialData={baselineData ? (baselineData as unknown as EnergyData) : undefined}
              onSave={handleSaveBaseline}
              onCancel={() => setShowBaselineForm(false)}
              title="Set Baseline Data"
              isBaseline={true}
            />
          </div>
        </div>
      )}

      {editingYear && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <DataEntryForm
              initialData={yearsData.find(y => y.id === editingYear)?.data}
              onSave={handleSaveYear}
              onCancel={() => setEditingYear(null)}
              title={`Edit ${yearsData.find(y => y.id === editingYear)?.name} Data`}
            />
          </div>
        </div>
      )}

      {showAddYearDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Year</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Year Number</label>
                <input
                  type="number"
                  min={nextYear}
                  value={newYearNumber || ''}
                  onChange={(e) => setNewYearNumber(parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded-md"
                  placeholder={`e.g., ${nextYear}`}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddYearDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddYear} disabled={newYearNumber <= 0}>
                  Add Year
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
