// import { type NextRequest, NextResponse } from "next/server"
// import { login } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   try {
//     const { username, password, rememberMe } = await request.json()

//     const user = await login(username, password)

//     if (!user) {
//       return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
//     }

//     return NextResponse.json({ user })
//   } catch (error) {
//     console.error("Login error:", error)
//     return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
//   }
// }

import { type NextRequest, NextResponse } from "next/server"
import { login } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Login API route called")
    
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      )
    }

    const { username, password, rememberMe } = body

    // Validate input
    if (!username || !password) {
      console.log("Missing username or password")
      return NextResponse.json(
        { error: "Username and password are required" }, 
        { status: 400 }
      )
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      console.log("Invalid data types for username or password")
      return NextResponse.json(
        { error: "Username and password must be strings" }, 
        { status: 400 }
      )
    }

    console.log(`Attempting login for user: ${username}`)

    // Attempt login
    const user = await login(username.trim(), password, Boolean(rememberMe))

    if (!user) {
      console.log(`Login failed for user: ${username}`)
      return NextResponse.json(
        { error: "Invalid username or password" }, 
        { status: 401 }
      )
    }

    console.log(`Login successful for user: ${username}`)
    
    // Return success response
    return NextResponse.json(
      { 
        user,
        message: "Login successful" 
      }, 
      { status: 200 }
    )

  } catch (error) {
    console.error("Login API error:", error)
    
    // Return detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json(
      { 
        error: "An error occurred during login",
        ...(isDevelopment && { details: error instanceof Error ? error.message : String(error) })
      }, 
      { status: 500 }
    )
  }
}