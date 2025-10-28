import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuth } from "./lib/auth"

// Define permissions required for specific API paths
const apiPermissions: Record<string, string[]> = {
  "/api/users/invite": ["manage_users"], // Only users with 'manage_users' role can invite
  "/api/users": ["manage_users", "read_users"], // For listing users
  "/api/users/": ["manage_users", "read_users"], // For getting, updating, deleting user details/status
  "/api/roles": ["manage_roles"], // For listing and creating roles
  "/api/roles/": ["manage_roles"], // For updating and deleting roles
  "/api/permissions/users/": ["manage_permissions"], // For user permissions
  "/api/permissions/groups/": ["manage_permissions"], // For group permissions
  "/api/groups": ["manage_groups"], // For listing and creating groups
  "/api/groups/": ["manage_groups"], // For updating and deleting groups
  // Add other API paths and their required permissions here
};

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/login", "/accept-invite", "/set-password"]
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // API paths that handle their own authentication (e.g., login, accept-invite)
  const selfAuthenticatedApiPaths = [
    "/api/auth/login", 
    "/api/users/accept-invite", 
    "/api/accept-invite",
    "/api/auth/reset-password" // Add reset-password endpoint to self-authenticated paths
  ]
  const isSelfAuthenticatedApiPath = selfAuthenticatedApiPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Allow access to uploaded files without authentication
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    console.log(`Middleware: Allowing public access to uploaded file: ${request.nextUrl.pathname}`);
    return NextResponse.next()
  }

  // Allow access to document download API routes without authentication
  if (request.nextUrl.pathname.startsWith('/api/documents/download/')) {
    console.log(`Middleware: Allowing public access to document download: ${request.nextUrl.pathname}`);
    return NextResponse.next()
  }

  // Skip middleware for public paths and self-authenticated API paths
  if (isPublicPath || isSelfAuthenticatedApiPath) {
    console.log(`Middleware: Skipping for public/self-authenticated path: ${request.nextUrl.pathname}`);
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth-token")?.value
  console.log(`Middleware: Intercepting path: ${request.nextUrl.pathname}`);
  console.log(`Middleware: Auth token present in request cookies: ${!!token}`); // Logs true/false

  if (!token) {
    // Redirect to login if no token and not an API path, otherwise return 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      console.log("Middleware: No token for API path. Returning 401.");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    } else {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      console.log(`Middleware: No token for UI path. Redirecting to login from: ${request.nextUrl.pathname}`);
      return NextResponse.redirect(loginUrl)
    }
  }

  // Verify token
  const payload = await verifyAuth(token)
  console.log(`Middleware: Token verification result for ${request.nextUrl.pathname}: ${!!payload ? "SUCCESS" : "FAILED"}`);
  if (!payload) {
    // Redirect to login if token is invalid, otherwise return 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      console.log("Middleware: Invalid token for API path. Returning 401.");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    } else {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", request.nextUrl.pathname)
      console.log(`Middleware: Invalid token for UI path. Redirecting to login from: ${request.nextUrl.pathname}`);
      return NextResponse.redirect(loginUrl)
    }
  }

  // If authenticated, proceed. Permission checks will be handled in API routes.
  console.log(`Middleware: Authentication successful for path: ${request.nextUrl.pathname}. Proceeding.`);
  
  // Add production-ready cache management headers
  const response = NextResponse.next()
  
  // Add cache-busting headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
    response.headers.set("Surrogate-Control", "no-store")
  }
  
  // Add cache-busting headers for pages in development
  if (process.env.NODE_ENV === "development") {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")
  }
  
  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}