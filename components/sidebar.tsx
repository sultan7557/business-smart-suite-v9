"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  FileInput,
  Award,
  BarChart,
  AlertTriangle,
  Briefcase,
  Users,
  FileIcon as FileDescription,
  FileWarning,
  AlertOctagon,
  HardHat,
  FileCode,
  ChevronDown,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ColorSchemeSwitcher } from "./color-scheme-switcher"
import CustomSectionDialog from "./custom-section-dialog"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Map of icon names to components
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
  FileDescription,
  FileWarning,
  AlertOctagon,
  HardHat,
  FileCode,
}

interface CustomSection {
  id: string
  title: string
  description?: string
  icon: string
  order: number
}

export default function Sidebar() {
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(true)

  const fetchCustomSections = async () => {
    try {
      const response = await fetch("/api/custom-sections")
      if (!response.ok) throw new Error("Failed to fetch sections")
      const data = await response.json()
      setCustomSections(data)
    } catch (error) {
      console.error("Error fetching custom sections:", error)
      toast.error("Failed to load custom sections")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomSections()
  }, [])

  const staticMenuItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
    { icon: <BookOpen className="h-5 w-5" />, label: "Manual", href: "/manual" },
    { icon: <FileText className="h-5 w-5" />, label: "Policies", href: "/policies" },
    { icon: <ClipboardList className="h-5 w-5" />, label: "Procedures", href: "/procedures" },
    { icon: <FileInput className="h-5 w-5" />, label: "Forms", href: "/forms" },
    { icon: <Award className="h-5 w-5" />, label: "Certificates", href: "/certificate" },
    { icon: <BarChart className="h-5 w-5" />, label: "Registers", href: "/registers" },
    { icon: <Briefcase className="h-5 w-5" />, label: "Business Continuity", href: "/business-continuity" },
    { icon: <Users className="h-5 w-5" />, label: "Management Reviews", href: "/management-reviews" },
    { icon: <FileDescription className="h-5 w-5" />, label: "Job Descriptions", href: "/job-descriptions" },
    { icon: <FileWarning className="h-5 w-5" />, label: "Work Instructions", href: "/work-instructions" },
    { icon: <AlertOctagon className="h-5 w-5" />, label: "Risk Assessments", href: "/risk-assessments" },
    { icon: <AlertOctagon className="h-5 w-5" />, label: "COSHH", href: "/coshh" },
    { icon: <FileCode className="h-5 w-5" />, label: "Technical File", href: "/technical-file" },
  ]

  // Convert custom sections to menu items
  const customMenuItems = customSections.map((section) => {
    const IconComponent = ICON_MAP[section.icon as keyof typeof ICON_MAP] || FileText
    return {
      icon: <IconComponent className="h-5 w-5" />,
      label: section.title,
      href: `/custom-sections/${section.id}`,
    }
  })

  // Combine static and custom menu items
  const allMenuItems = [...staticMenuItems, ...customMenuItems]

  return (
    <aside 
      className={`relative bg-gradient-to-b from-[#2d1e3e] to-[#1a1428] text-white min-h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className={`p-4 border-b border-white/10 ${isCollapsed ? "px-2" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && <h2 className="text-xl font-semibold">Business Suite</h2>}
          <div className="flex items-center gap-2">
            {!isCollapsed && <ColorSchemeSwitcher />}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isCollapsed && (
          <div className="flex gap-2">
            <CustomSectionDialog onSuccess={fetchCustomSections} />
            <Button variant="outline" size="sm" className="flex-1 bg-white/10 hover:bg-white/20 border-none">
              ↺ Reset
            </Button>
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {allMenuItems.map((item, index) => (
            <li key={index}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.href} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <span className="text-white/70 group-hover:text-white transition-colors">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="bg-slate-900 text-white">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`p-4 border-t border-white/10 ${isCollapsed ? "px-2" : ""}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href="/settings" 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <Settings className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">Settings</span>
                )}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-slate-900 text-white">
                Settings
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}

