"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Add a useEffect to log when the component mounts
  useEffect(() => {
    console.log("LoginPage component mounted.");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("--- handleSubmit: Form submission initiated. ---"); // HIGH VISIBILITY LOG
    e.preventDefault() // Ensure this is the very first thing
    setIsLoading(true)
    setError("")

    try {
      console.log("handleSubmit: Preparing to send login request to /api/auth/login");
      console.log("handleSubmit: Username:", username);
      console.log("handleSubmit: Password (length):", password.length > 0 ? "set" : "empty");
      console.log("handleSubmit: Remember Me:", rememberMe);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, rememberMe }),
        credentials: "include",
      })

      console.log("handleSubmit: Received response from /api/auth/login. Status:", response.status);
      const data = await response.json()
      console.log("handleSubmit: Response data:", data);

      if (!response.ok) {
        console.error("handleSubmit: Login API returned an error:", data.error || "Unknown error");
        throw new Error(data.error || "Login failed")
      }

      console.log("handleSubmit: Login successful, attempting redirect.");
      window.location.href = "/" // This will cause a full page reload

    } catch (err: any) {
      console.error("handleSubmit: An error occurred during login process:", err);
      setError(err.message || "An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
      console.log("--- handleSubmit: Login process finished. ---");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-600 text-white p-2 mr-2 text-2xl font-bold">B</div>
            <span className="text-2xl font-semibold">Business Smart Suite</span>
          </div>
          <p className="text-gray-600">ISO 9001 Compliance Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* IMPORTANT: Ensure no <Link> component wraps this form or button */}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="link" size="sm" className="px-0">
              Forgot password?
            </Button>
            <Button variant="link" size="sm" className="px-0">
              Contact support
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
