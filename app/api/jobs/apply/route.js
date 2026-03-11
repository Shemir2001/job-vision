import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Application from "@/lib/models/Application"
import Job from "@/lib/models/Job"
import { createAdminNotification, getAllAdminIds } from "@/lib/notification-utils"

// POST - Apply for a job
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Must be logged in to apply" },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await request.json()
    const { jobId, resume, coverLetter } = body

    // Check if job exists
    const job = await Job.findById(jobId)
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: session.user.id,
      job: jobId
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied for this job", alreadyApplied: true },
        { status: 400 }
      )
    }

    // Create application
    const application = new Application({
      user: session.user.id,
      job: jobId,
      resume,
      coverLetter,
      status: 'applied'
    })

    await application.save()

    // Notify admins
    try {
      const adminIds = await getAllAdminIds()
      const job = await Job.findById(jobId).select('title')

      adminIds.forEach(adminId => {
        createAdminNotification(adminId, {
          type: 'job_application',
          title: 'New Job Application',
          message: `A user applied for "${job.title}"`,
          reference: {
            model: 'Application',
            id: application._id
          },
          data: {
            applicationId: application._id,
            jobId,
            userId: session.user.id,
            userName: session.user.name,
            jobTitle: job.title
          }
        })
      })
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError)
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error applying for job:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// GET - Get user's applications
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit')) || 20
    const page = parseInt(searchParams.get('page')) || 1

    let query = { user: session.user.id }

    if (status) {
      query.status = status
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location salary type')
      .sort({ appliedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    const total = await Application.countDocuments(query)

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
