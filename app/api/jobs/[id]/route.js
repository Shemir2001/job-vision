import { NextResponse } from "next/server"
import { fetchRemotiveJobs, fetchArbeitnowJobs, fetchJSearchJobs } from "@/lib/job-apis"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const decodedId = decodeURIComponent(id)

    console.log("Fetching job with ID:", decodedId)

    let job = null

    // First, try to fetch by MongoDB _id (for manual jobs)
    try {
      await connectDB()
      // Check if id looks like a MongoDB ObjectId (24 hex characters)
      if (decodedId.match(/^[0-9a-f]{24}$/i)) {
        job = await Job.findById(decodedId).lean()
        if (job) {
          return NextResponse.json({ job })
        }
      }
    } catch (e) {
      console.error('Error fetching by MongoDB _id:', e)
    }

    // Parse the source and original ID from the external ID
    // Format: source_originalId or source-originalId (e.g., remotive_2086540, manual_1234_abc, arbeitnow_job-slug, jsearch_abc123)
    let source, originalId
    if (decodedId.includes('_')) {
      const parts = decodedId.split('_')
      source = parts[0]
      originalId = parts.slice(1).join('_')
    } else if (decodedId.includes('-')) {
      const parts = decodedId.split('-')
      source = parts[0]
      originalId = parts.slice(1).join('-')
    } else {
      source = decodedId
      originalId = ''
    }

    if (source === 'manual') {
      // Fetch manually added job from database by externalId
      try {
        await connectDB()
        job = await Job.findOne({ externalId: decodedId, source: 'manual' }).lean()
      } catch (dbError) {
        console.error('Error fetching manual job from database:', dbError)
      }
    } else if (source === 'remotive') {
      // Fetch from Remotive API and find the specific job
      const result = await fetchRemotiveJobs({ limit: 200 })
      job = result.jobs?.find(j => {
        // Match by the numeric ID part
        const jobIdFromExternal = j.externalId?.split('_')[1]
        return jobIdFromExternal === originalId || j.externalId === decodedId
      })
      
      // If not found in first 200, try fetching more
      if (!job) {
        // Remotive returns all jobs, so search by ID directly
        const allJobs = await fetchRemotiveJobs({ limit: 500 })
        job = allJobs.jobs?.find(j => {
          const jobIdFromExternal = j.externalId?.split('_')[1]
          return jobIdFromExternal === originalId || j.externalId === decodedId
        })
      }
    } else if (source === 'arbeitnow') {
      // Fetch from Arbeitnow API and find the specific job
      // Try multiple pages
      for (let page = 1; page <= 5 && !job; page++) {
        const result = await fetchArbeitnowJobs({ page })
        job = result.jobs?.find(j => {
          const jobSlug = j.externalId?.split('_').slice(1).join('_')
          return jobSlug === originalId || j.externalId === decodedId
        })
      }
    } else if (source === 'jsearch') {
      // For JSearch, we need to search with the job ID
      // JSearch has a job-details endpoint we can use
      const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || "e00e96ee10msh44441924279141ap1a69efjsnb20fc47ab150"
      
      try {
        const response = await fetch(
          `https://jsearch.p.rapidapi.com/job-details?job_id=${encodeURIComponent(originalId)}`,
          {
            headers: {
              "X-RapidAPI-Key": JSEARCH_API_KEY,
              "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            },
            cache: 'force-cache',
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.data && data.data.length > 0) {
            const jobData = data.data[0]
            job = {
              externalId: `jsearch_${jobData.job_id}`,
              source: "jsearch",
              title: jobData.job_title,
              company: {
                name: jobData.employer_name,
                logo: jobData.employer_logo,
                website: jobData.employer_website,
              },
              location: {
                city: jobData.job_city,
                state: jobData.job_state,
                country: jobData.job_country,
                isRemote: jobData.job_is_remote || false,
              },
              description: jobData.job_description,
              requirements: jobData.job_highlights?.Qualifications || [],
              responsibilities: jobData.job_highlights?.Responsibilities || [],
              benefits: jobData.job_highlights?.Benefits || [],
              salary: {
                min: jobData.job_min_salary,
                max: jobData.job_max_salary,
                currency: jobData.job_salary_currency || "USD",
                period: jobData.job_salary_period?.toLowerCase() || "yearly",
              },
              type: jobData.job_employment_type?.toLowerCase().replace("_", "-") || "full-time",
              applyUrl: jobData.job_apply_link,
              postedAt: new Date(jobData.job_posted_at_datetime_utc),
            }
          }
        }
      } catch (e) {
        console.error("JSearch job details error:", e)
      }
    } else if (source === 'adzuna') {
      // Adzuna jobs redirect directly to the company site
      // We don't have a way to fetch individual jobs, so return basic info
      job = {
        externalId: decodedId,
        source: "adzuna",
        title: "Job from Adzuna",
        company: { name: "See original listing" },
        location: { country: "Various" },
        description: "Please click 'Apply Now' to view the full job details on the original site.",
        applyUrl: `https://www.adzuna.com/details/${originalId}`,
        postedAt: new Date(),
      }
    }
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found", id: decodedId },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { error: "Failed to fetch job details" },
      { status: 500 }
    )
  }
}


