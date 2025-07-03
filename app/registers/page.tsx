import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { RegistersClient } from "@/components/registers-client"
import Link from "next/link"
import { FileText, ClipboardList, FileInput, Award, BarChart, AlertTriangle, Briefcase, Users, Settings, FileWarning, FileCode, HardHat } from "lucide-react"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string; sort?: string }>
}) {
  const canEdit = await hasPermission("write");
  const canDelete = await hasPermission("delete");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch active or archived register categories based on showArchived flag
  const categories = await prisma.registerCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      registers: {
        where: {
          archived: showArchived,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: sortParam === "name" 
      ? { title: "asc" } 
      : sortParam === "date" 
      ? { updatedAt: "desc" } 
      : { order: "asc" },
  });
  
  // If showing archived, also get archived registers from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.registerCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        registers: {
          where: {
            archived: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    
    // Filter out categories with no archived registers
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.registers.length > 0
    );
    
    // Combine all categories with archived registers
    categories.push(...archivedInActiveCategories);
  }

  const navigationItems = [
    { icon: <ClipboardList className="h-5 w-5" />, label: "Audit Schedule", href: "/audit-schedule", description: "Manage and track audit schedules" },
    { icon: <Users className="h-5 w-5" />, label: "Interested Parties", href: "/interested-parties", description: "View and manage interested parties" },
    { icon: <FileText className="h-5 w-5" />, label: "Organisational Context", href: "/organisational-context", description: "Organizational context and structure" },
    { icon: <Award className="h-5 w-5" />, label: "Objectives", href: "/objectives", description: "Track and manage objectives" },
    { icon: <Settings className="h-5 w-5" />, label: "Maintenance", href: "/maintenance", description: "Maintenance schedules and records" },
    { icon: <FileWarning className="h-5 w-5" />, label: "Improvement Register", href: "/improvement-register", description: "Track improvement initiatives" },
    { icon: <FileCode className="h-5 w-5" />, label: "Statement of Applicability", href: "/statement-of-applicability", description: "View statement of applicability" },
    { icon: <FileText className="h-5 w-5" />, label: "Legal Register", href: "/legal-register", description: "Legal requirements and compliance" },
    { icon: <Users className="h-5 w-5" />, label: "Suppliers", href: "/suppliers", description: "Manage supplier information" },
    { icon: <HardHat className="h-5 w-5" />, label: "Training", href: "/training", description: "Training records and schedules" },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Navigation Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200 ease-in-out"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                    <span className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-transparent group-hover:ring-blue-500 transition-all duration-200" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6">
        <RegistersClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
      </div>
    </div>
  );
}
