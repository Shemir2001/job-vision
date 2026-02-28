// app/api/user/profile/route.js

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"

// Helper function to get MongoDB user ID from session
async function getUserId(session) {
  if (!session?.user?.email) {
    return null
  }
  
  await dbConnect()
  const user = await User.findOne({ email: session.user.email })
  return user?._id
}

// GET - Fetch user profile
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    await dbConnect()

    const user = await User.findById(userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      phone, 
      headline, 
      bio, 
      location,
      website,
      linkedinUrl
    } = body

    await dbConnect()

    const updateData = {
      name,
      phone,
      headline,
      bio,
      website,
      linkedinUrl,
      updatedAt: new Date()
    }

    // Update location if provided
   // Update location if provided - User model only has country field
if (location) {
  updateData.location = {
    country: location.trim()
  }
}

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}