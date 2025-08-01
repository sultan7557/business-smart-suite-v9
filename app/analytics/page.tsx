"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import DashboardCharts from "@/components/dashboard-charts"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import useSWR, { mutate } from "swr"
import Link from "next/link"

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(format(new Date().setMonth(new Date().getMonth() - 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: rootCauseData = [], isLoading: loadingRootCauses } = useSWR(`/api/dashboard/root-causes?startDate=${startDate}&endDate=${endDate}`, fetcher)
  const { data: achievementRateData = [], isLoading: loadingAchievementRates } = useSWR(`/api/dashboard/achievement-rates?startDate=${startDate}&endDate=${endDate}`, fetcher)
  const { data: costOfQualityData = { data: [], summary: {} }, isLoading: loadingCostOfQuality } = useSWR(`/api/dashboard/cost-of-quality?startDate=${startDate}&endDate=${endDate}`, fetcher)
  const loading = loadingRootCauses || loadingAchievementRates || loadingCostOfQuality

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 pt-12 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl px-6 py-2 text-lg font-semibold border-blue-300 text-blue-700 hover:bg-blue-50">
              ← Back to Home
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        </div>
        <div className="bg-white rounded-3xl border border-blue-200 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-2xl mr-4 shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <p className="text-gray-600">Real-time insights from Improvement Register data</p>
              </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="w-full justify-start bg-gray-100 rounded-2xl p-1">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-gray-700">Dashboard</TabsTrigger>
                <TabsTrigger value="mytasks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-gray-700">My tasks <span className="ml-1 bg-blue-200 text-blue-800 rounded-full px-2 text-xs">0</span></TabsTrigger>
                <TabsTrigger value="systemtasks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-gray-700">System tasks</TabsTrigger>
                <TabsTrigger value="training" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-gray-700">Training</TabsTrigger>
                <TabsTrigger value="permissions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-gray-700">Permissions</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6 p-6 bg-blue-50 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-900"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-blue-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-900"
                    />
                  </div>
                </div>
                <Button 
                  onClick={async () => {
                    if (!startDate || !endDate) {
                      toast({
                        title: "Error",
                        description: "Please enter both start and end dates",
                        variant: "destructive",
                      })
                      return
                    }
                    const start = new Date(startDate)
                    const end = new Date(endDate)
                    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                      toast({
                        title: "Error",
                        description: "Please enter valid dates",
                        variant: "destructive",
                      })
                      return
                    }
                    if (start > end) {
                      toast({
                        title: "Error",
                        description: "Start date must be before end date",
                        variant: "destructive",
                      })
                      return
                    }
                    toast({
                      title: "Refreshing...",
                      description: "Refreshing dashboard data...",
                    })
                    try {
                      await Promise.all([
                        mutate(`/api/dashboard/root-causes?startDate=${startDate}&endDate=${endDate}`),
                        mutate(`/api/dashboard/achievement-rates?startDate=${startDate}&endDate=${endDate}`),
                        mutate(`/api/dashboard/cost-of-quality?startDate=${startDate}&endDate=${endDate}`),
                      ])
                      toast({
                        title: "Success",
                        description: "Dashboard data refreshed",
                      })
                    } catch (error) {
                      console.error("Error refreshing dashboard data:", error)
                      toast({
                        title: "Error",
                        description: "Failed to refresh dashboard data",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-2 shadow-lg"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              <TabsContent value="dashboard" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading dashboard data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white border border-blue-200 shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-900">Improvement Register - Root Cause Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardCharts.RootCauseChart data={rootCauseData} />
                      </CardContent>
                    </Card>

                    <Card className="bg-white border border-blue-200 shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-900">Areas and Achievement Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardCharts.AchievementRateChart data={achievementRateData} />
                      </CardContent>
                    </Card>

                    <Card className="col-span-1 lg:col-span-2 bg-white border border-blue-200 shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-gray-900">Cost of Quality (12-Month Period)</CardTitle>
                        {costOfQualityData.summary && (
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Total Cost: £{costOfQualityData.summary.totalCost?.toFixed(2) || '0.00'}</span>
                            <span>Total Items: {costOfQualityData.summary.totalCount || 0}</span>
                            <span>Average Cost: £{costOfQualityData.summary.averageCost?.toFixed(2) || '0.00'}</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <DashboardCharts.CostOfQualityChart data={costOfQualityData.data || []} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mytasks">
                <div className="p-8 text-center text-gray-600">
                  No tasks assigned.
                </div>
              </TabsContent>

              <TabsContent value="systemtasks">
                <div className="p-8 text-center text-gray-600">
                  No system tasks available.
                </div>
              </TabsContent>

              <TabsContent value="training">
                <div className="p-8 text-center text-gray-600">
                  No training items available.
                </div>
              </TabsContent>

              <TabsContent value="permissions">
                <div className="p-8 text-center text-gray-600">
                  No permission changes available.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 