import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import Application from "@/lib/models/Application"
import JobImpression from "@/lib/models/JobImpression"
import User from "@/lib/models/User"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check admin access
    await connectDB()
    const user = await User.findById(session.user.id)

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      )
    }

    // Get job applications count
    const applicationsCount = await Application.countDocuments({ job: jobId })

    // Get job impressions directly from Job model
    const job = await Job.findById(jobId)
    const impressions = job?.impressions || 0

    // Get detailed analytics from JobImpression collection
    const impressionStats = await JobImpression.aggregate([
      { $match: { jobId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])

    const clicks = impressionStats.find(s => s._id === 'click')?.count || 0
    const views = impressionStats.find(s => s._id === 'view')?.count || 0
    const searches = impressionStats.find(s => s._id === 'search')?.count || 0

    // Get unique viewers
    const uniqueViewers = await JobImpression.distinct('user', {
      jobId,
      user: { $ne: null }
    })

    // Get recent impressions
    const recentImpressions = await JobImpression.find({ jobId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'name email')
      .lean()

    // Get recent applications
    const recentApplications = await Application.find({ job: jobId })
      .sort({ appliedAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .lean()

    return NextResponse.json({
      jobId,
      applications: {
        total: applicationsCount
      },
      impressions: {
        total: impressions,
        clicks,
        views,
        searches,
        uniqueViewers: uniqueViewers.length,
        conversionRate: impressions > 0 ? ((applicationsCount / impressions) * 100).toFixed(2) + '%' : '0%'
      },
      recentImpressions,
      recentApplications
    })
  } catch (error) {
    console.error("Error fetching job stats:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
