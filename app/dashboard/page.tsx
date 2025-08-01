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
  BookOpen,
  ClipboardList,
  FileInput,
  Award,
  BarChart,
  Briefcase,
  FileIcon as FileDescription,
  FileWarning,
  AlertOctagon,
  FileCode,
  Settings,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  AlertTriangle,
  HardHat,
} from "lucide-react"
import DashboardCharts from "@/components/dashboard-charts"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import useSWR, { mutate } from "swr"
import Link from "next/link"
import CustomSectionDialog from "@/components/custom-section-dialog"
import { createElement } from "react"

export default function DashboardPage() {
  // State for date inputs
  const [startDate, setStartDate] = useState(format(new Date().setMonth(new Date().getMonth() - 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // State for chart data
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data: rootCauseData = [], isLoading: loadingRootCauses } = useSWR("/api/dashboard/root-causes", fetcher)
  const { data: achievementRateData = [], isLoading: loadingAchievementRates } = useSWR("/api/dashboard/achievement-rates", fetcher)
  const { data: costOfQualityData = [], isLoading: loadingCostOfQuality } = useSWR("/api/dashboard/cost-of-quality", fetcher)
  const loading = loadingRootCauses || loadingAchievementRates || loadingCostOfQuality

  const [customSections, setCustomSections] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/custom-sections")
      .then(res => res.json())
      .then(data => setCustomSections(data))
  }, [])

  const navigationSections = [
    {
      title: "Core Management",
      description: "Essential business operations and compliance",
      color: "from-slate-700 to-slate-800",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      icon: <Shield className="h-6 w-6" />,
      items: [
        { icon: <BookOpen className="h-5 w-5" />, label: "Manual", href: "/manual", description: "Company policies and procedures" },
        { icon: <FileText className="h-5 w-5" />, label: "Policies", href: "/policies", description: "Organizational policies" },
        { icon: <ClipboardList className="h-5 w-5" />, label: "Procedures", href: "/procedures", description: "Standard operating procedures" },
        { icon: <FileInput className="h-5 w-5" />, label: "Forms", href: "/forms", description: "Business forms and templates" },
        { icon: <Award className="h-5 w-5" />, label: "Certificates", href: "/certificate", description: "Certifications and licenses" },
      ]
    },
    {
      title: "Compliance & Risk",
      description: "Risk management and regulatory compliance",
      color: "from-blue-800 to-blue-900",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: <TrendingUp className="h-6 w-6" />,
      items: [
        { icon: <Briefcase className="h-5 w-5" />, label: "Business Continuity", href: "/business-continuity", description: "Business continuity planning" },
        { icon: <Users className="h-5 w-5" />, label: "Management Reviews", href: "/management-reviews", description: "Management review processes" },
        { icon: <FileDescription className="h-5 w-5" />, label: "Job Descriptions", href: "/job-descriptions", description: "Role definitions and responsibilities" },
        { icon: <FileWarning className="h-5 w-5" />, label: "Work Instructions", href: "/work-instructions", description: "Detailed work procedures" },
        { icon: <AlertOctagon className="h-5 w-5" />, label: "Risk Assessments", href: "/risk-assessments", description: "Risk evaluation and mitigation" },
        { icon: <AlertOctagon className="h-5 w-5" />, label: "COSHH", href: "/coshh", description: "Control of substances hazardous to health" },
        { icon: <FileCode className="h-5 w-5" />, label: "Technical File", href: "/technical-file", description: "Technical documentation" },
      ]
    },
    {
      title: "Registers & Records",
      description: "Documentation and record keeping",
      color: "from-green-700 to-green-800",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: <BarChart className="h-6 w-6" />,
      items: [
        { icon: <Calendar className="h-5 w-5" />, label: "Audit Schedule", href: "/audit-schedule", description: "Audit planning and scheduling" },
        { icon: <Users className="h-5 w-5" />, label: "Interested Parties", href: "/interested-parties", description: "Stakeholder management" },
        { icon: <FileText className="h-5 w-5" />, label: "Organisational Context", href: "/organisational-context", description: "Organizational structure" },
        { icon: <Target className="h-5 w-5" />, label: "Objectives", href: "/objectives", description: "Strategic objectives and goals" },
        { icon: <PenTool className="h-5 w-5" />, label: "Maintenance", href: "/maintenance", description: "Maintenance schedules and records" },
        { icon: <BarChart2 className="h-5 w-5" />, label: "Improvement Register", href: "/improvement-register", description: "Continuous improvement tracking" },
        { icon: <FileCheck className="h-5 w-5" />, label: "Statement of Applicability", href: "/statement-of-applicability", description: "ISO compliance statements" },
        { icon: <Scale className="h-5 w-5" />, label: "Legal Register", href: "/legal-register", description: "Legal requirements and compliance" },
        { icon: <Truck className="h-5 w-5" />, label: "Suppliers", href: "/suppliers", description: "Supplier management and evaluation" },
        { icon: <GraduationCap className="h-5 w-5" />, label: "Training", href: "/training", description: "Training records and development" },
      ]
    },
    {
      title: "Administration",
      description: "System administration and settings",
      color: "from-red-700 to-red-800",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: <Settings className="h-6 w-6" />,
      items: [
        { icon: <Users className="h-5 w-5" />, label: "Permissions", href: "/admin/permissions", description: "User access management" },
        { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/settings", description: "System configuration" },
      ]
    }
  ]

  const ICON_MAP = {
    FileText,
    BookOpen,
    ClipboardList,
    FileInput,
    Award,
    BarChart,
    AlertTriangle,
    Briefcase,
    Users,
    FileWarning,
    AlertOctagon,
    HardHat,
    FileCode,
  }

  function renderIcon(iconName: string, className: string) {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP] || FileText
    return createElement(IconComponent, { className })
  }

  const mergedSections = [
    ...navigationSections,
    ...customSections.map((section, index) => ({
      title: section.title,
      description: section.description,
      color: "from-gray-600 to-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: renderIcon(section.icon, "h-6 w-6"),
      items: [
        {
          icon: renderIcon(section.icon, "h-5 w-5"),
          label: section.title,
          href: `/custom-sections/${section.id}`,
          description: section.description || "Custom section"
        }
      ]
    }))
  ]

  return (
    <div className="min-h-screen relative">
      {/* LAYER 1: Sophisticated Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Multiple visual layers for depth and elegance */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]"></div>
      </div>

      {/* LAYER 2: Harmonized Purple-Themed Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Elegant Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.08)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse"></div>
        
        {/* Sophisticated Floating Elements */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-gradient-to-r from-indigo-500/25 to-purple-500/25 rounded-lg opacity-50 animate-bounce" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-gradient-to-r from-violet-500/25 to-purple-500/25 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s', animationDuration: '4.5s' }}></div>
        <div className="absolute bottom-10 right-1/3 w-18 h-18 bg-gradient-to-r from-purple-500/25 to-indigo-500/25 rounded-lg opacity-40 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '5.5s' }}></div>
        
        {/* Additional elegant elements */}
        <div className="absolute top-1/3 left-1/6 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.2s' }}></div>
        <div className="absolute top-2/3 right-1/6 w-14 h-14 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg opacity-45 animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '5.1s' }}></div>
        
        {/* Elegant Rotating Elements */}
        <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg shadow-lg animate-spin" style={{ animationDuration: '10s' }}></div>
        </div>
        <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-lg shadow-lg animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>
                </div>
        
        {/* Sophisticated Pulsing Rings */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-24 border-4 border-purple-400/20 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-pink-400/25 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              </div>
        
        {/* Elegant Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
                </div>

      {/* LAYER 3: Content (Professional Navigation Grid) */}
      <div className="relative z-10">
        <div className="px-6 pt-12 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header */}
            <div className="flex justify-between items-center mb-12">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Business Smart Suite</h1>
                <p className="text-purple-200 text-xl drop-shadow">Your comprehensive business management portal</p>
                </div>
              <div className="flex items-center gap-4">
                <CustomSectionDialog onSuccess={() => {
                  fetch("/api/custom-sections").then(res => res.json()).then(data => setCustomSections(data))
                }} />
              </div>
            </div>

            {/* Revolutionary Company Portal - Out of This World Design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {mergedSections.map((section, sectionIndex) => {
                const isCustomSection = sectionIndex >= navigationSections.length
                
                return (
                  <div key={sectionIndex} className="group">
                    <div
                      className={`relative overflow-hidden rounded-3xl transition-all duration-1000 ease-out
                        bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80
                        border border-slate-600/30 hover:border-slate-500/50
                        shadow-2xl hover:shadow-3xl
                        backdrop-blur-2xl
                        hover:scale-[1.03] hover:-translate-y-2
                        focus-within:ring-2 focus-within:ring-slate-400/40 focus-within:outline-none
                        ${sectionIndex === 0 ? 'hover:shadow-blue-500/20 hover:bg-gradient-to-br hover:from-slate-900/90 hover:via-blue-900/20 hover:to-slate-900/90' : ''}
                        ${sectionIndex === 1 ? 'hover:shadow-purple-500/20 hover:bg-gradient-to-br hover:from-slate-900/90 hover:via-purple-900/20 hover:to-slate-900/90' : ''}
                        ${sectionIndex === 2 ? 'hover:shadow-emerald-500/20 hover:bg-gradient-to-br hover:from-slate-900/90 hover:via-emerald-900/20 hover:to-slate-900/90' : ''}
                        ${sectionIndex === 3 ? 'hover:shadow-orange-500/20 hover:bg-gradient-to-br hover:from-slate-900/90 hover:via-orange-900/20 hover:to-slate-900/90' : ''}
                        ${isCustomSection ? 'hover:shadow-gray-500/20 hover:bg-gradient-to-br hover:from-slate-900/90 hover:via-gray-900/20 hover:to-slate-900/90' : ''}
                      `}
                      style={{ minHeight: 'clamp(400px, 45vh, 450px)' }}
                      role="region"
                      aria-label={`${section.title} section`}
                    >
                      {/* Sophisticated Background Elements */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-5 blur-3xl
                          ${sectionIndex === 0 ? 'bg-blue-500' : ''}
                          ${sectionIndex === 1 ? 'bg-purple-500' : ''}
                          ${sectionIndex === 2 ? 'bg-emerald-500' : ''}
                          ${sectionIndex === 3 ? 'bg-orange-500' : ''}
                          ${isCustomSection ? 'bg-gray-500' : ''}
                        `}></div>
                        <div className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-5 blur-2xl
                          ${sectionIndex === 0 ? 'bg-blue-400' : ''}
                          ${sectionIndex === 1 ? 'bg-purple-400' : ''}
                          ${sectionIndex === 2 ? 'bg-emerald-400' : ''}
                          ${sectionIndex === 3 ? 'bg-orange-400' : ''}
                          ${isCustomSection ? 'bg-gray-400' : ''}
                        `}></div>
                      </div>

                      {/* Enterprise Section Header */}
                      <div className="relative p-12 lg:p-16 border-b border-slate-600/30">
                        {/* Subtle Accent Pattern */}
                        <div className={`absolute inset-0 opacity-10
                          ${sectionIndex === 0 ? 'bg-gradient-to-br from-blue-500/20 via-blue-400/15 to-transparent' : ''}
                          ${sectionIndex === 1 ? 'bg-gradient-to-br from-purple-500/20 via-purple-400/15 to-transparent' : ''}
                          ${sectionIndex === 2 ? 'bg-gradient-to-br from-emerald-500/20 via-emerald-400/15 to-transparent' : ''}
                          ${sectionIndex === 3 ? 'bg-gradient-to-br from-orange-500/20 via-orange-400/15 to-transparent' : ''}
                          ${isCustomSection ? 'bg-gradient-to-br from-gray-500/20 via-gray-400/15 to-transparent' : ''}
                        `}></div>
                        
                        {/* Premium Corner Accent */}
                        <div className={`absolute top-0 right-0 w-48 h-48 opacity-15
                          ${sectionIndex === 0 ? 'bg-gradient-to-bl from-blue-400 via-blue-300 to-transparent' : ''}
                          ${sectionIndex === 1 ? 'bg-gradient-to-bl from-purple-400 via-purple-300 to-transparent' : ''}
                          ${sectionIndex === 2 ? 'bg-gradient-to-bl from-emerald-400 via-emerald-300 to-transparent' : ''}
                          ${sectionIndex === 3 ? 'bg-gradient-to-bl from-orange-400 via-orange-300 to-transparent' : ''}
                          ${isCustomSection ? 'bg-gradient-to-bl from-gray-400 via-gray-300 to-transparent' : ''}
                        `}></div>
                        
                        <div className="flex items-center gap-10 lg:gap-16 relative z-10">
                          {/* Revolutionary Enterprise Icon */}
                          <div className={`enterprise-hero-icon inline-flex items-center justify-center rounded-3xl
                            ${sectionIndex === 0 ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 shadow-2xl shadow-blue-500/40' : ''}
                            ${sectionIndex === 1 ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 shadow-2xl shadow-purple-500/40' : ''}
                            ${sectionIndex === 2 ? 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 shadow-2xl shadow-emerald-500/40' : ''}
                            ${sectionIndex === 3 ? 'bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 shadow-2xl shadow-orange-500/40' : ''}
                            ${isCustomSection ? 'bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400 shadow-2xl shadow-gray-500/40' : ''}
                          `}>
                            <div className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg">
                              {section.icon}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h2 className="enterprise-section-title text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                              {section.title}
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* Revolutionary Navigation Grid */}
                      <div className="relative p-10 lg:p-14">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                          {section.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={item.href}
                              className="group/item block focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:ring-offset-2 focus:ring-offset-slate-900"
                              aria-label={`Navigate to ${item.label}`}
                            >
                              <div
                                className={`enterprise-nav-item aspect-square p-4 lg:p-6 rounded-2xl border transition-all duration-1000 ease-out relative overflow-hidden
                                  bg-gradient-to-br from-slate-800/60 via-slate-700/50 to-slate-800/60
                                  border-slate-600/40 hover:border-slate-500/60
                                  shadow-xl hover:shadow-2xl hover:shadow-3xl
                                  transform hover:-translate-y-4 hover:scale-[1.1]
                                  focus:ring-2 focus:ring-slate-400/40
                                  ${sectionIndex === 0 ? 'hover:shadow-blue-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:via-blue-800/30 hover:to-slate-800/80' : ''}
                                  ${sectionIndex === 1 ? 'hover:shadow-purple-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:via-purple-800/30 hover:to-slate-800/80' : ''}
                                  ${sectionIndex === 2 ? 'hover:shadow-emerald-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:via-emerald-800/30 hover:to-slate-800/80' : ''}
                                  ${sectionIndex === 3 ? 'hover:shadow-orange-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:via-orange-800/30 hover:to-slate-800/80' : ''}
                                  ${isCustomSection ? 'hover:shadow-gray-500/30 hover:bg-gradient-to-br hover:from-slate-800/80 hover:via-gray-800/30 hover:to-slate-800/80' : ''}
                                `}
                              >
                                {/* Enterprise Accent Border */}
                                <div className={`absolute top-0 left-0 w-3 h-full opacity-0 group-hover/item:opacity-100 transition-all duration-1000
                                  ${sectionIndex === 0 ? 'bg-gradient-to-b from-blue-400 to-blue-300' : ''}
                                  ${sectionIndex === 1 ? 'bg-gradient-to-b from-purple-400 to-purple-300' : ''}
                                  ${sectionIndex === 2 ? 'bg-gradient-to-b from-emerald-400 to-emerald-300' : ''}
                                  ${sectionIndex === 3 ? 'bg-gradient-to-b from-orange-400 to-orange-300' : ''}
                                  ${isCustomSection ? 'bg-gradient-to-b from-gray-400 to-gray-300' : ''}
                                `}></div>
                                
                                {/* Premium Corner Glow */}
                                <div className={`absolute top-0 right-0 w-24 h-24 opacity-0 group-hover/item:opacity-50 transition-opacity duration-1000
                                  ${sectionIndex === 0 ? 'bg-gradient-to-bl from-blue-300 to-transparent' : ''}
                                  ${sectionIndex === 1 ? 'bg-gradient-to-bl from-purple-300 to-transparent' : ''}
                                  ${sectionIndex === 2 ? 'bg-gradient-to-bl from-emerald-300 to-transparent' : ''}
                                  ${sectionIndex === 3 ? 'bg-gradient-to-bl from-orange-300 to-transparent' : ''}
                                  ${isCustomSection ? 'bg-gradient-to-bl from-gray-300 to-transparent' : ''}
                                `}></div>
                                
                                <div className="flex flex-col items-center text-center h-full justify-between relative z-10">
                                  {/* Optimized Big Navigation Icon - Perfectly Centered */}
                                  <div className={`optimized-nav-icon flex items-center justify-center rounded-2xl mb-2 lg:mb-3 transition-all duration-1000 group-hover/item:scale-110
                                    ${sectionIndex === 0 ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white shadow-xl shadow-blue-500/40' : ''}
                                    ${sectionIndex === 1 ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 text-white shadow-xl shadow-purple-500/40' : ''}
                                    ${sectionIndex === 2 ? 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-400 text-white shadow-xl shadow-emerald-500/40' : ''}
                                    ${sectionIndex === 3 ? 'bg-gradient-to-br from-orange-600 via-orange-500 to-orange-400 text-white shadow-xl shadow-orange-500/40' : ''}
                                    ${isCustomSection ? 'bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400 text-white shadow-xl shadow-gray-500/40' : ''}
                                  `}>
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 drop-shadow-lg flex items-center justify-center">
                                      {item.icon}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 flex flex-col justify-center px-1">
                                    <h3 className="font-poppins font-semibold text-slate-200 text-xs lg:text-sm leading-tight drop-shadow-lg group-hover/item:text-white transition-all duration-700 line-clamp-2">
                                      {item.label}
                                    </h3>
                                  </div>
                                  
                                  {/* Enterprise Hover Glow */}
                                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover/item:opacity-20 transition-all duration-1000
                                    ${sectionIndex === 0 ? 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200' : ''}
                                    ${sectionIndex === 1 ? 'bg-gradient-to-br from-purple-400 via-purple-300 to-purple-200' : ''}
                                    ${sectionIndex === 2 ? 'bg-gradient-to-br from-emerald-400 via-emerald-300 to-emerald-200' : ''}
                                    ${sectionIndex === 3 ? 'bg-gradient-to-br from-orange-400 via-orange-300 to-orange-200' : ''}
                                    ${isCustomSection ? 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-200' : ''}
                                  `}></div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Professional Analytics Button */}
            <div className="flex justify-center mt-12">
              <Link href="/analytics">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50 backdrop-blur-sm">
                  View Analytics Dashboard
                </button>
              </Link>
            </div>
              </div>
              </div>

        {/* Professional System Status */}
        <div className="text-center pb-12">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 shadow-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium drop-shadow">System Status: Optimal Performance</span>
              </div>
        </div>
      </div>
    </div>
  )
}

