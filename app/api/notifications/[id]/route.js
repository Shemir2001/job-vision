import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/lib/models/Notification"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PATCH - Mark notification as read
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (notification.admin.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete notification
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    const notification = await Notification.findById(id)

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (notification.admin.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await Notification.findByIdAndDelete(id)

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
