"use client"

import { useState, useEffect } from 'react';
import EnergyDashboard from '../components/energy-consumption/energy-dashboard';
import { EnergyData, YearData, BaselineData } from '../types/energy-consumption';
import { createEmptyEnergyData } from '../lib/energy-consumption-utils';
import { useToast } from '@/hooks/use-toast';

export default function EnergyConsumptionPage() {
  const [baselineData, setBaselineData] = useState<BaselineData | null>(null);
  const [yearsData, setYearsData] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [baselineRes, yearsRes] = await Promise.all([
        fetch('/api/energy/baseline', { cache: 'no-store' }),
        fetch('/api/energy/years', { cache: 'no-store' })
      ]);

      const baselineJson = await baselineRes.json();
      const yearsJson = await yearsRes.json();

      setBaselineData(baselineJson.baseline || null);
      setYearsData(yearsJson.years || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load energy consumption data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBaseline = async (data: EnergyData) => {
    try {
      const res = await fetch('/api/energy/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to save baseline');

      setBaselineData({ id: 'baseline', ...data, createdAt: new Date(), updatedAt: new Date() });
      toast({
        title: "Baseline Data Saved",
        description: "Your baseline energy consumption data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving baseline:', error);
      toast({
        title: "Error",
        description: "Failed to save baseline data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveYear = async (yearId: string, data: EnergyData) => {
    try {
      const res = await fetch(`/api/energy/years/${yearId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to save year');

      setYearsData(prev => prev.map(year => 
        year.id === yearId 
          ? { ...year, data, updatedAt: new Date() }
          : year
      ));
      
      toast({
        title: "Year Data Updated",
        description: "The year data has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving year:', error);
      toast({
        title: "Error",
        description: "Failed to update year data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddYear = async (yearNumber: number) => {
    try {
      const res = await fetch('/api/energy/years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: yearNumber, name: `Year ${yearNumber}` })
      });
      const json = await res.json();
      if (!res.ok || !json.year) throw new Error('Failed to create year');

      const newYear: YearData = {
        id: json.year.id,
        name: json.year.name,
        year: json.year.year,
        data: createEmptyEnergyData(),
        createdAt: json.year.createdAt,
        updatedAt: json.year.updatedAt
      };
      
      setYearsData(prev => [...prev, newYear]);
      
      toast({
        title: "New Year Added",
        description: `Year ${yearNumber} has been added successfully. You can now enter data for this year.`,
      });
    } catch (error) {
      console.error('Error adding year:', error);
      toast({
        title: "Error",
        description: "Failed to add new year. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteYear = async (yearId: string) => {
    try {
      const yearToDelete = yearsData.find(y => y.id === yearId);
      if (yearToDelete && confirm(`Are you sure you want to delete ${yearToDelete.name}? This action cannot be undone.`)) {
        const res = await fetch(`/api/energy/years/${yearId}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error('Failed to delete');

        setYearsData(prev => prev.filter(year => year.id !== yearId));
        
        toast({
          title: "Year Deleted",
          description: `${yearToDelete.name} has been deleted successfully.`,
        });
      }
    } catch (error) {
      console.error('Error deleting year:', error);
      toast({
        title: "Error",
        description: "Failed to delete year. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Energy Consumption Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EnergyDashboard
        baselineData={baselineData}
        yearsData={yearsData}
        onSaveBaseline={handleSaveBaseline}
        onSaveYear={handleSaveYear}
        onAddYear={handleAddYear}
        onDeleteYear={handleDeleteYear}
      />
    </div>
  );
}
