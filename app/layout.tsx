import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "sonner"
import { getUser } from "@/lib/auth"
import { headers } from "next/headers"

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
        <ThemeProvider>
          {isAdminPermissionsRoute ? (
            <div className="flex flex-col h-full">
              <header className="bg-gray-800 text-white p-4">
                <h1 className="text-2xl font-bold">Permissions Management</h1>
              </header>
              <main className="flex-1 p-4 overflow-auto">
                {children}
              </main>
            </div>
          ) : (
            <div className="flex flex-col min-h-screen">
              {isAuthenticated && <Header />}
              <main className="flex-1 p-0 overflow-auto">{children}</main>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}