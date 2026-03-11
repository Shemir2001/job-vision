import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import JobImpression from "@/lib/models/JobImpression"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * POST /api/jobs/increment-impression
 * Safely increments the impression count for a job
 * For authenticated users: one impression per user per job per type ever
 * For anonymous users: one per IP per 24 hours
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { jobId, jobSource = 'manual', type = 'view', source = 'listing', searchQuery } = body

    // Validate jobId
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      )
    }

    // Get user session and IP
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    let isNewImpression = false

    // Check if impression already exists and create if new
    if (userId) {
      // For authenticated users - check if they already have this impression
      const existingImpression = await JobImpression.findOne({
        jobId,
        user: userId,
        type
      }).lean()

      if (existingImpression) {
        // Already exists, don't create or increment
        return NextResponse.json({
          success: true,
          isNew: false,
          message: `You have already recorded a ${type} for this job`
        }, { status: 200 })
      }

      // Create new impression
      const impression = new JobImpression({
        jobId,
        jobSource,
        user: userId,
        type,
        source,
        searchQuery: searchQuery || undefined,
        userAgent
      })

      await impression.save()
      isNewImpression = true

    } else {
      // For anonymous users - check if they already viewed within 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const existingImpression = await JobImpression.findOne({
        jobId,
        user: null,
        type,
        ipAddress,
        createdAt: { $gte: twentyFourHoursAgo }
      }).lean()

      if (existingImpression) {
        // Already viewed within 24 hours, don't create or increment
        return NextResponse.json({
          success: true,
          isNew: false,
          message: `You have already recorded a ${type} for this job`
        }, { status: 200 })
      }

      // Create new impression
      const impression = new JobImpression({
        jobId,
        jobSource,
        user: null,
        type,
        source,
        searchQuery: searchQuery || undefined,
        userAgent,
        ipAddress
      })

      await impression.save()
      isNewImpression = true
    }

    // Only increment job impressions if it's a new impression
    if (isNewImpression) {
      // Atomically increment impressions count on Job document
      let jobQuery = {}
      let updateQuery = { $inc: { impressions: 1 } }

      // Handle both MongoDB ObjectId and externalId strings
      if (jobSource === 'manual') {
        // ManualJob - use _id (ObjectId)
        jobQuery = { _id: jobId }
      } else {
        // External API jobs - use externalId (string)
        jobQuery = { externalId: jobId, source: jobSource }
      }

      // Atomic update - increment impressions safely
      const updatedJob = await Job.findOneAndUpdate(
        jobQuery,
        updateQuery,
        { new: true }
      )

      return NextResponse.json({
        success: true,
        isNew: true,
        impressions: updatedJob?.impressions || 0
      }, { status: 200 })
    }

  } catch (error) {
    console.error("Error incrementing impression:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
