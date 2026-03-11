import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/lib/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET notifications for admin
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit')) || 20
    const page = parseInt(searchParams.get('page')) || 1

    let query = { admin: session.user.id }

    if (unreadOnly) {
      query.read = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      admin: session.user.id,
      read: false
    })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create notification
export async function POST(request) {
  try {
    const body = await request.json()

    await connectDB()

    const notification = new Notification(body)
    await notification.save()

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
