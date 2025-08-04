import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
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
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS for above-the-fold content */
          body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
          .header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 1rem; }
          .main { flex: 1; padding: 1rem; }
        `
      }} />

        <ThemeProvider>
          {isAdminPermissionsRoute ? (
            <PermissionsLayout>{children}</PermissionsLayout>
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