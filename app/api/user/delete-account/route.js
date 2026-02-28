// app/api/user/delete-account/route.js

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import SavedJob from "@/lib/models/SavedJob"
import Application from "@/lib/models/Application"

// Helper function to get MongoDB user ID from session
async function getUserId(session) {
  if (!session?.user?.email) {
    return null
  }
  
  await dbConnect()
  const user = await User.findOne({ email: session.user.email })
  return user?._id
}

// DELETE - Delete user account
export async function DELETE(request) {
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
    const { confirmEmail } = body

    // Verify email confirmation
    if (confirmEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Email confirmation does not match" },
        { status: 400 }
      )
    }

    await dbConnect()

    // Delete all user-related data
    await Promise.all([
      SavedJob.deleteMany({ user: userId }),
      Application.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId)
    ])

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    )
  }
}