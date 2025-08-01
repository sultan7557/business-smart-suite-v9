"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  value: number
}

interface AchievementRateData {
  name: string
  onTime: number
  late: number
  total: number
  averageCost: number
}

interface CostOfQualityData {
  name: string
  totalCost: number
  count: number
  averageCost: number
}

const RootCauseChart = ({ data }: { data: ChartData[] }) => {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip formatter={(value, name) => [`${value} occurrences`, 'Root Cause Count']} />
          <Legend />
          <Bar dataKey="value" name="Root Cause Count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const AchievementRateChart = ({ data }: { data: AchievementRateData[] }) => {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip formatter={(value, name) => [
            name === 'onTime' ? `${value} on-time` : `${value} late`, 
            name === 'onTime' ? 'On Time' : 'Late'
          ]} />
          <Legend />
          <Bar dataKey="onTime" name="On Time" fill="#3b82f6" />
          <Bar dataKey="late" name="Late" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const CostOfQualityChart = ({ data }: { data: CostOfQualityData[] }) => {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip formatter={(value, name) => [
            name === 'totalCost' ? `£${value.toFixed(2)}` : value, 
            name === 'totalCost' ? 'Total Cost' : 'Item Count'
          ]} />
          <Legend />
          <Bar dataKey="totalCost" name="Total Cost (£)" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const DashboardCharts = {
  RootCauseChart,
  AchievementRateChart,
  CostOfQualityChart,
}

export default DashboardCharts

