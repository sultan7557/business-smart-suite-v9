"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  AlertCircle, 
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
import { EnergyData, MONTHS } from '../../types/energy-consumption';
import { createEmptyEnergyData, validateEnergyData } from '../../lib/energy-consumption-utils';

interface DataEntryFormProps {
  initialData?: EnergyData;
  onSave: (data: EnergyData) => void | Promise<void>;
  onCancel: () => void;
  title: string;
  isBaseline?: boolean;
}

export default function DataEntryForm({ 
  initialData, 
  onSave, 
  onCancel, 
  title, 
  isBaseline = false 
}: DataEntryFormProps) {
  const [data, setData] = useState<EnergyData>(initialData || createEmptyEnergyData());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (
    category: keyof EnergyData,
    subCategory: string | null,
    monthIndex: number,
    value: string
  ) => {
    const numValue = parseFloat(value);
    const safeValue = isNaN(numValue) ? 0 : numValue;
    setData(prev => {
      const newData = { ...prev } as any;
      if (subCategory) {
        newData[category][subCategory][monthIndex] = safeValue;
      } else {
        newData[category][monthIndex] = safeValue;
      }
      return newData as EnergyData;
    });
  };

  const handleSave = async () => {
    const validation = validateEnergyData(data);
    setValidationErrors(validation.errors);
    if (!validation.isValid) return;

    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const MonthHeader = () => (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="flex items-center gap-2 p-2">
        <Label className="font-semibold text-sm">Month</Label>
        <div className="flex gap-1 overflow-x-auto">
          {MONTHS.map((m, idx) => (
            <Button
              key={m}
              variant={idx === activeMonthIdx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMonthIdx(idx)}
              className="min-w-[56px]"
            >
              {m}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const MonthRow = ({ label, category, subKey }: { label: string; category: keyof EnergyData; subKey?: string }) => (
    <div className="flex items-center gap-2 py-2">
      <Label className="w-40 shrink-0">{label}</Label>
      <div className="flex gap-2 overflow-x-auto">
        {MONTHS.map((_, idx) => (
          <Input
            key={idx}
            type="number"
            step="0.01"
            min="0"
            value={subKey ? (data as any)[category][subKey][idx] : (data as any)[category][idx]}
            onChange={(e) => handleInputChange(category, subKey || null, idx, e.target.value)}
            className={`w-24 text-center ${idx === activeMonthIdx ? 'ring-2 ring-blue-500' : ''}`}
          />
        ))}
      </div>
    </div>
  );

  const Section = (
    { title, icon, children }:
    { title: string; icon: React.ReactNode; children: React.ReactNode }
  ) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-full overflow-x-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <MonthHeader />

      <Tabs defaultValue="energy" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          <TabsTrigger value="waste">Waste</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="space-y-4">
          {Section({
            title: 'Electricity Consumption (kWh)',
            icon: <Zap className="h-5 w-5 text-blue-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Electricity - Meter 1', category: 'electricity', subKey: 'meter1' })}
                {MonthRow({ label: 'Electricity - Meter 2', category: 'electricity', subKey: 'meter2' })}
              </div>
            )
          })}

          {Section({
            title: 'Gas Consumption (kWh)',
            icon: <Droplets className="h-5 w-5 text-red-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Gas - Meter 1', category: 'gas', subKey: 'meter1' })}
                {MonthRow({ label: 'Gas - Meter 2', category: 'gas', subKey: 'meter2' })}
              </div>
            )
          })}

          {Section({
            title: 'Fuel Efficiency (mpg)',
            icon: <Fuel className="h-5 w-5 text-yellow-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Average MPG', category: 'fuel' })}
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          {Section({
            title: 'Water Consumption (m³)',
            icon: <Droplets className="h-5 w-5 text-cyan-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Water 1', category: 'water', subKey: 'water1' })}
                {MonthRow({ label: 'Water 2', category: 'water', subKey: 'water2' })}
              </div>
            )
          })}

          {Section({
            title: 'Paper Usage (reams)',
            icon: <FileText className="h-5 w-5 text-purple-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Paper (reams)', category: 'paper' })}
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="waste" className="space-y-4">
          {Section({
            title: 'General Waste (tonnes)',
            icon: <Trash2 className="h-5 w-5 text-gray-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'General Waste 1', category: 'generalWaste', subKey: 'waste1' })}
                {MonthRow({ label: 'General Waste 2', category: 'generalWaste', subKey: 'waste2' })}
              </div>
            )
          })}

          {Section({
            title: 'Recycled Waste (tonnes)',
            icon: <Recycle className="h-5 w-5 text-green-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Recycled Waste 1', category: 'recycledWaste', subKey: 'waste1' })}
                {MonthRow({ label: 'Recycled Waste 2', category: 'recycledWaste', subKey: 'waste2' })}
              </div>
            )
          })}

          {Section({
            title: 'Food Waste (tonnes)',
            icon: <Apple className="h-5 w-5 text-pink-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Food Waste 1', category: 'foodWaste', subKey: 'waste1' })}
                {MonthRow({ label: 'Food Waste 2', category: 'foodWaste', subKey: 'waste2' })}
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {Section({
            title: 'Scrap Metal (tonnes)',
            icon: <Scissors className="h-5 w-5 text-orange-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Scrap Metal', category: 'scrapMetal' })}
              </div>
            )
          })}

          {Section({
            title: 'Wood Waste (tonnes)',
            icon: <TreePine className="h-5 w-5 text-amber-700" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Wood', category: 'wood' })}
              </div>
            )
          })}

          {Section({
            title: 'Card Bales (tonnes)',
            icon: <Package className="h-5 w-5 text-lime-500" />,
            children: (
              <div className="space-y-2">
                {MonthRow({ label: 'Card Bales', category: 'cardBales' })}
              </div>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

