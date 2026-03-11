import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/lib/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * GET /api/admin/notifications
 * Fetches unread notifications for the current admin user
 */
export async function GET(request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Build query
    const query = { admin: session.user.id }
    if (unreadOnly) {
      query.read = false
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      admin: session.user.id,
      read: false
    })

    return NextResponse.json({
      notifications,
      unreadCount
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/notifications/mark-read
 * Mark notification as read
 */
export async function POST(request) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all as read for this admin
      await Notification.updateMany(
        { admin: session.user.id, read: false },
        { read: true, readAt: new Date() }
      )
    } else if (notificationId) {
      // Mark single notification as read
      await Notification.findByIdAndUpdate(
        notificationId,
        { read: true, readAt: new Date() }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
