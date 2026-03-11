import { NextResponse } from "next/server"
import { fetchAllJobs } from "@/lib/job-apis"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get filter parameters
    const query = searchParams.get('q') || ''
    const country = searchParams.get('country') || ''
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''
    const remote = searchParams.get('remote') === 'true'
    const experience = searchParams.get('experience') || ''
    const featured = searchParams.get('featured') === 'true'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20

    console.log('\n🔍 API Request:', { query, country, category, type, remote, experience, featured, page, limit })

    // Fetch jobs with API-level filters
    const result = await fetchAllJobs({
      query,
      country,
      category,
    })

    let jobs = result.jobs || []

    console.log(`📦 Jobs from fetchAllJobs: ${jobs.length}`)

    // Fetch manually added jobs from database
    let manuallyAddedJobs = []
    try {
      await connectDB()

      let dbQuery = { source: 'manual', isActive: true }

      // Apply featured filter if requested
      if (featured) {
        dbQuery.isFeatured = true
      }

      // Apply search query
      if (query) {
        dbQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { 'company.name': { $regex: query, $options: 'i' } }
        ]
      }

      // Apply category filter
      if (category && category !== 'all') {
        dbQuery.category = category
      }

      // Apply country filter
      if (country && country !== 'all') {
        dbQuery['location.country'] = { $regex: country, $options: 'i' }
      }

      manuallyAddedJobs = await Job.find(dbQuery).lean().sort({ postedAt: -1 })
      console.log(`📦 Jobs from Database (Manual): ${manuallyAddedJobs.length}`)
    } catch (dbError) {
      console.error('Error fetching from database:', dbError)
      // Continue without database jobs if there's an error
    }

    // Merge manually added jobs with external API jobs
    const formattedManualJobs = manuallyAddedJobs.map(job => ({
      ...job,
      externalId: job.externalId,
      source: job.source
    }))

    // Combine both job sources and remove duplicates by externalId
    const allJobs = [...jobs, ...formattedManualJobs]
    const uniqueJobsMap = new Map()
    allJobs.forEach(job => {
      if (!uniqueJobsMap.has(job.externalId)) {
        uniqueJobsMap.set(job.externalId, job)
      }
    })
    jobs = Array.from(uniqueJobsMap.values())
    // Sort by postedAt descending
    jobs.sort((a, b) => {
      const dateA = new Date(a.postedAt).getTime()
      const dateB = new Date(b.postedAt).getTime()
      return dateB - dateA
    })

    console.log(`📦 Total jobs after merging: ${jobs.length}`)

    // Apply additional filters on the backend
    
    // 1. Remote filter
    if (remote) {
      jobs = jobs.filter(job => job.location?.isRemote === true)
      console.log(`🏠 After remote filter: ${jobs.length}`)
    }

    // 2. Job type filter
    if (type && type !== 'all') {
      jobs = jobs.filter(job => {
        const jobType = (job.type || '').toLowerCase()
        const filterType = type.toLowerCase()
        return jobType === filterType || jobType.includes(filterType)
      })
      console.log(`💼 After type filter (${type}): ${jobs.length}`)
    }

    // 3. Experience level filter
    if (experience && experience !== 'all') {
      jobs = jobs.filter(job => {
        const jobExp = (job.experienceLevel || '').toLowerCase()
        return jobExp === experience.toLowerCase()
      })
      console.log(`📊 After experience filter (${experience}): ${jobs.length}`)
    }

    // Calculate pagination
    const totalResults = jobs.length
    const totalPages = Math.ceil(totalResults / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedJobs = jobs.slice(startIndex, endIndex)

    console.log(`📄 Pagination: page ${page}/${totalPages}, showing ${paginatedJobs.length} of ${totalResults} jobs\n`)

    return NextResponse.json({
      jobs: paginatedJobs,
      totalResults,
      page,
      totalPages,
      hasMore: endIndex < totalResults,
      breakdown: result.breakdown,
    })
  } catch (error) {
    console.error("❌ Jobs API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch jobs", 
        message: error.message,
        jobs: [], 
        totalResults: 0 
      },
      { status: 500 }
    )
  }
}