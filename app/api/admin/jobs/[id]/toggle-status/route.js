import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import User from "@/lib/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * PATCH /api/admin/jobs/[id]/toggle-status
 * Toggle job active/inactive status
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB()

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check admin access
    const user = await User.findById(session.user.id)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    // Get the job
    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Toggle the isActive status
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { isActive: !job.isActive },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Job ${updatedJob.isActive ? 'activated' : 'deactivated'} successfully`
    }, { status: 200 })
  } catch (error) {
    console.error("Error toggling job status:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
