import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import JobImpression from "@/lib/models/JobImpression"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { jobId, type = 'view', source = 'listing', searchQuery, jobSource = 'manual' } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Get user if authenticated
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // For authenticated users - check if impression already exists
    if (userId) {
      const existingImpression = await JobImpression.findOne({
        jobId,
        user: userId,
        type
      }).lean()

      if (existingImpression) {
        // Already recorded this impression
        return NextResponse.json({
          success: true,
          isNew: false,
          message: `Already recorded ${type} for this job`
        }, { status: 200 })
      }

      // Create new impression
      const impression = new JobImpression({
        jobId,
        jobSource,
        user: userId,
        type,
        source,
        searchQuery,
        userAgent,
      })

      await impression.save()

      return NextResponse.json({
        success: true,
        isNew: true,
        impression
      }, { status: 201 })
    } else {
      // For anonymous users - check if viewed within 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const existingImpression = await JobImpression.findOne({
        jobId,
        type,
        ipAddress,
        user: null,
        createdAt: { $gte: twentyFourHoursAgo }
      }).lean()

      if (existingImpression) {
        return NextResponse.json({
          success: true,
          isNew: false,
          message: `Already recorded ${type} in last 24 hours`
        }, { status: 200 })
      }

      const impression = new JobImpression({
        jobId,
        jobSource,
        user: null,
        type,
        source,
        searchQuery,
        userAgent,
        ipAddress
      })

      await impression.save()

      return NextResponse.json({
        success: true,
        isNew: true,
        impression
      }, { status: 201 })
    }
  } catch (error) {
    console.error("Error tracking impression:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET stats for a specific job
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      )
    }

    // Get impression stats - handle both ObjectId and string
    const stats = await JobImpression.aggregate([
      { $match: { jobId: jobId } }, // Works with both ObjectId and String
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])

    const totalImpressions = await JobImpression.countDocuments({ jobId })

    // Get unique viewers
    const uniqueViewers = await JobImpression.distinct('user', {
      jobId,
      user: { $ne: null }
    })

    return NextResponse.json({
      jobId,
      totalImpressions,
      uniqueViewers: uniqueViewers.length,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {})
    })
  } catch (error) {
    console.error("Error fetching impression stats:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
