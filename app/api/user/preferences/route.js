// app/api/user/preferences/route.js

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

// PUT - Update user preferences
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
      jobTypes,
      industries,
      locations,
      remotePreference,
      salaryExpectation,
      emailAlerts,
      alertFrequency
    } = body

    await dbConnect()

    const updateData = {
      'preferences.jobTypes': jobTypes,
      'preferences.industries': industries,
      'preferences.locations': locations,
      'preferences.remotePreference': remotePreference,
      'preferences.emailAlerts': emailAlerts,
      'preferences.alertFrequency': alertFrequency,
      updatedAt: new Date()
    }

    // Update salary expectation if provided
    if (salaryExpectation) {
      updateData['preferences.salaryExpectation'] = {
        min: salaryExpectation.min,
        max: salaryExpectation.max,
        currency: salaryExpectation.currency || 'USD'
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
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
      message: "Preferences updated successfully",
      preferences: user.preferences
    })
  } catch (error) {
    console.error("Error updating preferences:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update preferences" },
      { status: 500 }
    )
  }
}