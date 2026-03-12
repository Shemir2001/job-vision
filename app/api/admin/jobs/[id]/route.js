import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import User from "@/lib/models/User"

async function checkAdminAccess(session) {
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated" }
  }

  const user = await User.findById(session.user.id)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return { authorized: false, error: "Not authorized" }
  }

  return { authorized: true, user }
}

// PUT - Update job
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized || !access.user.adminPermissions?.canManageJobs) {
      return Response.json({ error: "Not authorized to manage jobs" }, { status: 403 })
    }

    await connectDB()

    const { id } = await params
    const body = await req.json()

    const job = await Job.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 })
    }

    return Response.json(job)
  } catch (error) {
    console.error("Error updating job:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete job
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized || !access.user.adminPermissions?.canManageJobs) {
      return Response.json({ error: "Not authorized to manage jobs" }, { status: 403 })
    }

    await connectDB()

    const { id } = await params

    const job = await Job.findByIdAndDelete(id)

    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 })
    }

    return Response.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Error deleting job:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
