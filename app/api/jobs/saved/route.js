// app/api/jobs/saved/route.js

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import Job from "@/lib/models/Job"
import SavedJob from "@/lib/models/SavedJob"
// Helper function to normalize job type
function normalizeJobType(type) {
  if (!type) return 'full-time'
  
  // Convert underscores to hyphens and lowercase
  const normalized = type.toLowerCase().replace(/_/g, '-')
  
  // Valid types in your Job model
  const validTypes = ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'freelance']
  
  return validTypes.includes(normalized) ? normalized : 'full-time'
}

// Helper function to normalize experience level
function normalizeExperienceLevel(level) {
  if (!level) return 'mid'
  
  const normalized = level.toLowerCase().replace(/_/g, '-')
  
  // Valid levels in your Job model
  const validLevels = ['entry', 'mid', 'senior', 'lead', 'executive']
  
  return validLevels.includes(normalized) ? normalized : 'mid'
}
// Helper function to get MongoDB user ID from session
async function getUserId(session) {
  if (!session?.user?.email) {
    return null
  }
  
  await dbConnect()
  const user = await User.findOne({ email: session.user.email })
  return user?._id
}

// GET - Fetch all saved jobs for logged in user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    await dbConnect()

    // Fetch saved jobs with populated job details
    const savedJobs = await SavedJob.find({ 
      user: userId 
    })
      .populate('job')
      .sort({ savedAt: -1 })

    return NextResponse.json({
      success: true,
      savedJobs,
      total: savedJobs.length
    })
  } catch (error) {
    console.error("Error fetching saved jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
      { status: 500 }
    )
  }
}

// POST - Save a job
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to save jobs.", requiresAuth: true },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { job } = body

    if (!job || !job.externalId) {
      return NextResponse.json(
        { error: "Job data is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    // First, check if job exists in Job collection, if not create it
    let jobDoc = await Job.findOne({ externalId: job.externalId })
    
   if (!jobDoc) {
  // Create new job document with normalized data
  jobDoc = await Job.create({
    externalId: job.externalId,
    source: job.source || 'manual',
    title: job.title,
    company: {
      name: job.company?.name || job.company || 'Unknown Company',
      logo: job.company?.logo,
      website: job.company?.website,
      description: job.company?.description,
      size: job.company?.size,
      industry: job.company?.industry
    },
    location: {
      city: job.location?.city,
      state: job.location?.state,
      country: job.location?.country || 'Unknown',
      address: job.location?.address,
      isRemote: job.location?.isRemote || false
    },
    description: job.description || 'No description provided',
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    skills: Array.isArray(job.skills) ? job.skills : [],
    type: normalizeJobType(job.type), // Use helper function
    experienceLevel: normalizeExperienceLevel(job.experienceLevel), // Use helper function
    workArrangement: job.workArrangement || (job.location?.isRemote ? 'remote' : 'onsite'),
    salary: job.salary || {},
    category: job.category || 'Other',
    subcategory: job.subcategory,
    applyUrl: job.applyUrl || '#',
    applicationDeadline: job.applicationDeadline,
    postedAt: job.postedAt || new Date(),
    expiresAt: job.expiresAt,
    isActive: true,
    isFeatured: job.isFeatured || false,
    views: job.views || 0,
    applications: job.applications || 0,
    searchKeywords: job.searchKeywords || [],
    lastFetchedAt: new Date()
  })
}

    // Check if job is already saved by this user
    const existingSavedJob = await SavedJob.findOne({
      user: userId,
      job: jobDoc._id
    })

    if (existingSavedJob) {
      return NextResponse.json(
        { error: "Job already saved", alreadySaved: true },
        { status: 409 }
      )
    }

    // Create saved job entry
    const savedJob = await SavedJob.create({
      user: userId,
      job: jobDoc._id,
      savedAt: new Date()
    })

    // Populate the job details in the response
    await savedJob.populate('job')

    return NextResponse.json({
      success: true,
      message: "Job saved successfully",
      savedJob
    })
  } catch (error) {
    console.error("Error saving job:", error)
    return NextResponse.json(
      { error: "Failed to save job" },
      { status: 500 }
    )
  }
}

// DELETE - Unsave a job
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const externalId = searchParams.get('externalId')

    if (!externalId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the job by externalId
    const jobDoc = await Job.findOne({ externalId })

    if (!jobDoc) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Delete from SavedJob collection
    const result = await SavedJob.findOneAndDelete({
      user: userId,
      job: jobDoc._id
    })

    if (!result) {
      return NextResponse.json(
        { error: "Saved job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Job removed from saved jobs"
    })
  } catch (error) {
    console.error("Error removing saved job:", error)
    return NextResponse.json(
      { error: "Failed to remove saved job" },
      { status: 500 }
    )
  }
}

// PATCH - Update saved job notes
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { externalId, notes } = body

    if (!externalId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the job by externalId
    const jobDoc = await Job.findOne({ externalId })

    if (!jobDoc) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Update saved job notes
    const savedJob = await SavedJob.findOneAndUpdate(
      {
        user: userId,
        job: jobDoc._id
      },
      { notes },
      { new: true }
    ).populate('job')

    if (!savedJob) {
      return NextResponse.json(
        { error: "Saved job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Notes updated successfully",
      savedJob
    })
  } catch (error) {
    console.error("Error updating saved job:", error)
    return NextResponse.json(
      { error: "Failed to update saved job" },
      { status: 500 }
    )
  }
}