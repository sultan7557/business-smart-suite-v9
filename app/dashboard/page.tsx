"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  FileText,
  Target,
  PenTool,
  BarChart2,
  FileCheck,
  Scale,
  Truck,
  GraduationCap,
} from "lucide-react"
import DashboardCharts from "@/components/dashboard-charts"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export default function DashboardPage() {
  // State for date inputs
  const [startDate, setStartDate] = useState(format(new Date().setMonth(new Date().getMonth() - 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // State for chart data
  const [rootCauseData, setRootCauseData] = useState([])
  const [achievementRateData, setAchievementRateData] = useState([])
  const [costOfQualityData, setCostOfQualityData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch root causes
        const rootCausesResponse = await fetch("/api/dashboard/root-causes")
        if (!rootCausesResponse.ok) throw new Error("Failed to fetch root causes")
        const rootCauses = await rootCausesResponse.json()
        setRootCauseData(rootCauses)

        // Fetch achievement rates
        const achievementRatesResponse = await fetch("/api/dashboard/achievement-rates")
        if (!achievementRatesResponse.ok) throw new Error("Failed to fetch achievement rates")
        const achievementRates = await achievementRatesResponse.json()
        setAchievementRateData(achievementRates)

        // Fetch cost of quality
        const costOfQualityResponse = await fetch("/api/dashboard/cost-of-quality")
        if (!costOfQualityResponse.ok) throw new Error("Failed to fetch cost of quality")
        const costOfQuality = await costOfQualityResponse.json()
        setCostOfQualityData(costOfQuality)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleRefresh = async () => {
    // Validate dates
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please enter both start and end dates",
        variant: "destructive",
      })
      return
    }

    // Parse dates
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

    // Refresh data
    setLoading(true)
    try {
      // In a real app, you would pass the date range to the API
      const rootCausesResponse = await fetch(`/api/dashboard/root-causes?startDate=${startDate}&endDate=${endDate}`)
      if (!rootCausesResponse.ok) throw new Error("Failed to fetch root causes")
      const rootCauses = await rootCausesResponse.json()
      setRootCauseData(rootCauses)

      const achievementRatesResponse = await fetch(
        `/api/dashboard/achievement-rates?startDate=${startDate}&endDate=${endDate}`,
      )
      if (!achievementRatesResponse.ok) throw new Error("Failed to fetch achievement rates")
      const achievementRates = await achievementRatesResponse.json()
      setAchievementRateData(achievementRates)

      const costOfQualityResponse = await fetch(
        `/api/dashboard/cost-of-quality?startDate=${startDate}&endDate=${endDate}`,
      )
      if (!costOfQualityResponse.ok) throw new Error("Failed to fetch cost of quality")
      const costOfQuality = await costOfQualityResponse.json()
      setCostOfQualityData(costOfQuality)

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
    } finally {
      setLoading(false)
    }
  }

  const iconModules = [
    { icon: <Calendar className="h-6 w-6" />, label: "Audit schedule", href: "/audit-schedule" },
    { icon: <Users className="h-6 w-6" />, label: "Interested Parties", href: "/interested-parties" },
    { icon: <FileText className="h-6 w-6" />, label: "Organisational Context", href: "/organisational-context" },
    { icon: <Target className="h-6 w-6" />, label: "Objectives", href: "/objectives" },
    { icon: <PenTool className="h-6 w-6" />, label: "Maintenance", href: "/maintenance" },
    { icon: <BarChart2 className="h-6 w-6" />, label: "Improvement Register", href: "/improvement-register" },
    {
      icon: <FileCheck className="h-6 w-6" />,
      label: "Statement of Applicability",
      href: "/statement-of-applicability",
    },
    { icon: <Scale className="h-6 w-6" />, label: "Legal Register", href: "/legal-register" },
    { icon: <Truck className="h-6 w-6" />, label: "Suppliers", href: "/suppliers" },
    { icon: <GraduationCap className="h-6 w-6" />, label: "Training", href: "/training" },
    { icon: <Users className="h-6 w-6" />, label: "Permissions", href: "/admin/permissions" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {iconModules.map((module, index) => (
            <a
              key={index}
              href={module.href}
              className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-slate-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors mb-3">
                  {module.icon}
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  {module.label}
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <Tabs defaultValue="dashboard" className="p-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="mytasks" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                My tasks <span className="ml-1 bg-slate-100 text-slate-700 rounded-full px-2 text-xs">0</span>
              </TabsTrigger>
              <TabsTrigger value="systemtasks" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                System tasks
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Training
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Permissions
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">End date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            <TabsContent value="dashboard" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading dashboard data...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Improvement register reports by root cause</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DashboardCharts.RootCauseChart data={rootCauseData} />
                    </CardContent>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Areas and achievement rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DashboardCharts.AchievementRateChart data={achievementRateData} />
                    </CardContent>
                  </Card>

                  <Card className="col-span-1 md:col-span-2 bg-white">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Cost of quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DashboardCharts.CostOfQualityChart data={costOfQualityData} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mytasks">
              <div className="p-4 text-center text-gray-500">
                No tasks assigned.
              </div>
            </TabsContent>

            <TabsContent value="systemtasks">
              <div className="p-4 text-center text-gray-500">
                No system tasks available.
              </div>
            </TabsContent>

            <TabsContent value="training">
              <div className="p-4 text-center text-gray-500">
                No training items available.
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="p-4 text-center text-gray-500">
                No permission changes available.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

