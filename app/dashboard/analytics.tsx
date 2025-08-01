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
  const { data: rootCauseData = [], isLoading: loadingRootCauses } = useSWR("/api/dashboard/root-causes", fetcher)
  const { data: achievementRateData = [], isLoading: loadingAchievementRates } = useSWR("/api/dashboard/achievement-rates", fetcher)
  const { data: costOfQualityData = [], isLoading: loadingCostOfQuality } = useSWR("/api/dashboard/cost-of-quality", fetcher)
  const loading = loadingRootCauses || loadingAchievementRates || loadingCostOfQuality

  return (
    <div className="min-h-screen relative px-6 pt-12 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl px-6 py-2 text-lg font-semibold">
              ← Back to Home
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-neutral-100 drop-shadow-lg">Analytics Dashboard</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-900/90 via-slate-900/90 to-indigo-900/90 backdrop-blur-2xl rounded-3xl border border-purple-400/30 shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-2xl mr-4 shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-100 drop-shadow-lg">Analytics Dashboard</h2>
                <p className="text-neutral-200/90 drop-shadow">Real-time insights into your business performance</p>
              </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="w-full justify-start bg-white/10 backdrop-blur-sm rounded-2xl p-1">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-700/80 data-[state=active]:text-white rounded-xl text-neutral-200/90">Dashboard</TabsTrigger>
                <TabsTrigger value="mytasks" className="data-[state=active]:bg-purple-700/80 data-[state=active]:text-white rounded-xl text-neutral-200/90">My tasks <span className="ml-1 bg-white/20 text-white rounded-full px-2 text-xs">0</span></TabsTrigger>
                <TabsTrigger value="systemtasks" className="data-[state=active]:bg-purple-700/80 data-[state=active]:text-white rounded-xl text-neutral-200/90">System tasks</TabsTrigger>
                <TabsTrigger value="training" className="data-[state=active]:bg-purple-700/80 data-[state=active]:text-white rounded-xl text-neutral-200/90">Training</TabsTrigger>
                <TabsTrigger value="permissions" className="data-[state=active]:bg-purple-700/80 data-[state=active]:text-white rounded-xl text-neutral-200/90">Permissions</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-6 p-6 bg-white/5 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-neutral-200/90 mb-1">Start date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-white/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white/10 text-neutral-100 backdrop-blur-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-neutral-200/90 mb-1">End date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-white/20 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white/10 text-neutral-100 backdrop-blur-sm"
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-2 shadow-lg"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              <TabsContent value="dashboard" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-neutral-200/90">Loading dashboard data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-xl border border-purple-400/20 shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-neutral-100 drop-shadow">Improvement register reports by root cause</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardCharts.RootCauseChart data={rootCauseData} />
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-xl border border-purple-400/20 shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-neutral-100 drop-shadow">Areas and achievement rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardCharts.AchievementRateChart data={achievementRateData} />
                      </CardContent>
                    </Card>

                    <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-xl border border-purple-400/20 shadow-lg rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium text-neutral-100 drop-shadow">Cost of quality</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DashboardCharts.CostOfQualityChart data={costOfQualityData} />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="mytasks">
                <div className="p-8 text-center text-neutral-300/80">
                  No tasks assigned.
                </div>
              </TabsContent>

              <TabsContent value="systemtasks">
                <div className="p-8 text-center text-neutral-300/80">
                  No system tasks available.
                </div>
              </TabsContent>

              <TabsContent value="training">
                <div className="p-8 text-center text-neutral-300/80">
                  No training items available.
                </div>
              </TabsContent>

              <TabsContent value="permissions">
                <div className="p-8 text-center text-neutral-300/80">
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