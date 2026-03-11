import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import User from "@/lib/models/User"

// Middleware to check admin access
async function checkAdminAccess(session) {
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated" }
  }

  const user = await User.findById(session.user.id)
  if (!user?.isAdmin || user.role !== 'admin' && user.role !== 'superadmin') {
    return { authorized: false, error: "Not authorized" }
  }

  return { authorized: true, user }
}

// GET - Fetch all jobs (admin view with all data)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized) {
      return Response.json({ error: access.error }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const status = searchParams.get("status") // active, inactive, all
    const source = searchParams.get("source") // filter by source

    let query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "company.name": { $regex: search, $options: "i" } }
      ]
    }

    if (status === "active") {
      query.isActive = true
    } else if (status === "inactive") {
      query.isActive = false
    }

    if (source) {
      query.source = source
    }

    const total = await Job.countDocuments(query)
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    return Response.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new job
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized || !access.user.adminPermissions?.canManageJobs) {
      return Response.json({ error: "Not authorized to manage jobs" }, { status: 403 })
    }

    await connectDB()

    const body = await req.json()

    // Validate required fields
    const required = ["title", "company", "location", "description", "applyUrl", "category"]
    for (const field of required) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Create job with manual source
    const job = new Job({
      ...body,
      source: "manual",
      externalId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
      isFeatured: body.isFeatured || false,
      postedAt: new Date()
    })

    await job.save()

    return Response.json(job, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
