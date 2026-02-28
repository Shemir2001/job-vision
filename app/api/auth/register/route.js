import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    console.log("Registration attempt for:", email)

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Connect to database
    try {
      await connectDB()
      console.log("Database connected successfully")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 500 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      provider: "credentials"
    })

    await user.save()
    console.log("User created successfully:", user._id)

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Registration error:", error.message)
    console.error("Full error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred during registration" },
      { status: 500 }
    )
  }
}

