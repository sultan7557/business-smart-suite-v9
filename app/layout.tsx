import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { Toaster } from "sonner"
import { getUser } from "@/lib/auth"
import { headers } from "next/headers"
import PermissionsLayout from '@/app/admin/permissions/layout'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Smart Suite",
  description: "Compliance Management System",
    generator: 'Business Suite'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getUser()
  const isAuthenticated = !!user
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  const isAdminPermissionsRoute = pathname.startsWith('/admin/permissions')

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {isAdminPermissionsRoute ? (
            <PermissionsLayout>{children}</PermissionsLayout>
          ) : (
            <div className="flex flex-col min-h-screen">
              {isAuthenticated && <Header />}
              <div className="flex flex-1">
                {isAuthenticated && <Sidebar />}
                <main className="flex-1 p-0 overflow-auto">{children}</main>
              </div>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'