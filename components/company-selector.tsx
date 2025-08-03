"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  FileInput,
  Award,
  BarChart,
  Briefcase,
  Users,
  FileIcon as FileDescription,
  FileWarning,
  AlertOctagon,
  FileCode,
  Calendar,
  Target,
  PenTool,
  FileCheck,
  Scale,
  Truck,
  GraduationCap,
  Sparkles,
} from "lucide-react"

export default function CompanySelector() {
  const navigationSections = [
    {
      label: "Main Navigation",
      items: [
        { icon: <Home className="h-4 w-4" />, label: "Dashboard", href: "/" },
        { icon: <BarChart className="h-4 w-4" />, label: "Registers", href: "/registers" },
      ]
    },
    {
      label: "Document Management",
      items: [
        { icon: <BookOpen className="h-4 w-4" />, label: "Manual", href: "/manual" },
        { icon: <FileText className="h-4 w-4" />, label: "Policies", href: "/policies" },
        { icon: <ClipboardList className="h-4 w-4" />, label: "Procedures", href: "/procedures" },
        { icon: <FileInput className="h-4 w-4" />, label: "Forms", href: "/forms" },
        { icon: <Award className="h-4 w-4" />, label: "Certificates", href: "/certificate" },
      ]
    },
    {
      label: "Compliance & Risk",
      items: [
        { icon: <Briefcase className="h-4 w-4" />, label: "Business Continuity", href: "/business-continuity" },
        { icon: <Users className="h-4 w-4" />, label: "Management Reviews", href: "/management-reviews" },
        { icon: <FileDescription className="h-4 w-4" />, label: "Job Descriptions", href: "/job-descriptions" },
        { icon: <FileWarning className="h-4 w-4" />, label: "Work Instructions", href: "/work-instructions" },
        { icon: <AlertOctagon className="h-4 w-4" />, label: "Risk Assessments", href: "/risk-assessments" },
        { icon: <AlertOctagon className="h-4 w-4" />, label: "COSHH", href: "/coshh" },
        { icon: <FileCode className="h-4 w-4" />, label: "Technical File", href: "/technical-file" },
      ]
    },
    {
      label: "Registers & Records",
      items: [
        { icon: <Calendar className="h-4 w-4" />, label: "Audit Schedule", href: "/audit-schedule" },
        { icon: <Users className="h-4 w-4" />, label: "Interested Parties", href: "/interested-parties" },
        { icon: <FileText className="h-4 w-4" />, label: "Organisational Context", href: "/organisational-context" },
        { icon: <Target className="h-4 w-4" />, label: "Objectives", href: "/objectives" },
        { icon: <PenTool className="h-4 w-4" />, label: "Maintenance", href: "/maintenance" },
        { icon: <BarChart className="h-4 w-4" />, label: "Improvement Register", href: "/improvement-register" },
        { icon: <FileCheck className="h-4 w-4" />, label: "Statement of Applicability", href: "/statement-of-applicability" },
        { icon: <Scale className="h-4 w-4" />, label: "Legal Register", href: "/legal-register" },
        { icon: <Truck className="h-4 w-4" />, label: "Suppliers", href: "/suppliers" },
        { icon: <GraduationCap className="h-4 w-4" />, label: "Training", href: "/training" },
      ]
    },
    {
      label: "Administration",
      items: [
        { icon: <Users className="h-4 w-4" />, label: "Permissions", href: "/admin/permissions" },
      ]
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-4 py-2 h-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Business Smart Suite</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 sm:w-80 max-h-[80vh] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <DropdownMenuLabel className="font-semibold text-base text-gray-900">
            Navigation Menu
          </DropdownMenuLabel>
        </div>
        
        <ScrollArea className="h-[calc(80vh-60px)]">
          <div className="p-2">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4 last:mb-0">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 py-1.5">
                    {section.label}
                  </DropdownMenuLabel>
                  {section.items.map((item, itemIndex) => (
                    <DropdownMenuItem key={itemIndex} asChild className="px-2 py-1.5">
                      <Link 
                        href={item.href}
                        className="flex items-center gap-3 cursor-pointer w-full rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-600 flex-shrink-0">{item.icon}</span>
                        <span className="font-medium text-gray-900 truncate">{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                {sectionIndex < navigationSections.length - 1 && (
                  <div className="mx-2 my-2 border-t border-gray-200" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

