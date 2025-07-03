"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChartData {
  name: string
  value: number
}

interface AchievementRateData {
  name: string
  timely: number
  overdue: number
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
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Identified root causes" fill="#3b82f6" />
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
          <Tooltip />
          <Legend />
          <Bar dataKey="timely" name="Timely" fill="#3b82f6" />
          <Bar dataKey="overdue" name="Overdue" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const CostOfQualityChart = ({ data }: { data: ChartData[] }) => {
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
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Cost (£)" fill="#3b82f6" />
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

