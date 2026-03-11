import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/lib/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Get latest unread notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const sinceDayago = searchParams.get('sinceDayAgo') === 'true'

    let query = { admin: session.user.id, read: false }

    if (sinceDayago) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      query.createdAt = { $gte: oneDayAgo }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const unreadCount = await Notification.countDocuments({
      admin: session.user.id,
      read: false
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching latest notifications:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
