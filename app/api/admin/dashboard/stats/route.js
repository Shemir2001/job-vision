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

    await connectDB()

    // Check admin access
    const user = await User.findById(session.user.id)
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d' // 7d, 30d, 90d, all

    let dateFilter = {}
    const now = new Date()

    if (timeframe === '7d') {
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    } else if (timeframe === '30d') {
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    } else if (timeframe === '90d') {
      dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
    }

    // Total jobs posted
    const totalJobs = await Job.countDocuments()
    const manualJobs = await Job.countDocuments({ source: 'manual' })

    // Total impressions
    const totalImpressions = dateFilter.$gte
      ? await JobImpression.countDocuments({ timestamp: dateFilter })
      : await JobImpression.countDocuments()

    // Total applications
    const totalApplications = dateFilter.$gte
      ? await Application.countDocuments({ appliedAt: dateFilter })
      : await Application.countDocuments()

    // Total unique users
    const uniqueUsers = await Application.distinct('user')

    // Top 5 most viewed jobs
    const topJobs = await JobImpression.aggregate([
      dateFilter.$gte ? { $match: { timestamp: dateFilter } } : { $match: {} },
      { $group: { _id: '$jobId', jobSource: { $first: '$jobSource' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    // Enrich top jobs with job details (for manual jobs only, API jobs won't have details)
    const enrichedTopJobs = await Promise.all(
      topJobs.map(async (item) => {
        if (item.jobSource === 'manual') {
          const job = await Job.findById(item._id).select('title company').lean()
          return {
            jobId: item._id,
            title: job?.title || 'Unknown Job',
            company: job?.company?.name || 'Unknown Company',
            impressions: item.count,
            source: 'manual'
          }
        } else {
          return {
            jobId: item._id,
            title: 'API Job',
            company: item.jobSource,
            impressions: item.count,
            source: item.jobSource
          }
        }
      })
    )

    // Top 5 most applied jobs
    const topAppliedJobs = await Application.aggregate([
      dateFilter.$gte ? { $match: { appliedAt: dateFilter } } : { $match: {} },
      { $group: { _id: '$job', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' }
    ])

    // Impressions by type
    const impressionsByType = await JobImpression.aggregate([
      dateFilter.$gte ? { $match: { timestamp: dateFilter } } : { $match: {} },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])

    // New users in timeframe
    const newUsers = dateFilter.$gte
      ? await User.countDocuments({ createdAt: dateFilter })
      : 0

    return NextResponse.json({
      summary: {
        totalJobs,
        manualJobs,
        totalImpressions,
        totalApplications,
        uniqueApplicants: uniqueUsers.length,
        newUsers
      },
      topJobs: enrichedTopJobs,
      topAppliedJobs: topAppliedJobs.map(item => ({
        jobId: item._id,
        title: item.job.title,
        company: item.job.company?.name,
        applications: item.count
      })),
      impressionsByType: impressionsByType.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      timeframe
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
