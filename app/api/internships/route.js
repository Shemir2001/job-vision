import { NextResponse } from "next/server"
import { fetchRemotiveJobs, fetchArbeitnowJobs } from "@/lib/job-apis"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || 'internship'
    const country = searchParams.get('country') || ''
    const remote = searchParams.get('remote') === 'true'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20

    // Fetch internships from multiple sources
    const [remotiveResult, jsearchResult, arbeitnowResult] = await Promise.allSettled([
      fetchRemotiveJobs({ search: 'internship' }),
      fetchJSearchJobs({ 
        query: 'internship ' + query,
        location: country,
        page,
        employmentType: 'INTERN'
      }),
      fetchArbeitnowJobs({ page })
    ])

    let allInternships = []

    // Collect results from all sources
    if (remotiveResult.status === 'fulfilled' && remotiveResult.value.jobs) {
      const internships = remotiveResult.value.jobs.filter(job => 
        job.title?.toLowerCase().includes('intern') ||
        job.type === 'internship'
      )
      allInternships.push(...internships)
    }

    if (jsearchResult.status === 'fulfilled' && jsearchResult.value.jobs) {
      allInternships.push(...jsearchResult.value.jobs)
    }

    if (arbeitnowResult.status === 'fulfilled' && arbeitnowResult.value.jobs) {
      const internships = arbeitnowResult.value.jobs.filter(job =>
        job.title?.toLowerCase().includes('intern') ||
        job.title?.toLowerCase().includes('trainee') ||
        job.title?.toLowerCase().includes('graduate')
      )
      allInternships.push(...internships)
    }

    // Mark all as internships and apply filters
    allInternships = allInternships.map(job => ({
      ...job,
      type: 'internship'
    }))

    if (remote) {
      allInternships = allInternships.filter(job => job.location?.isRemote)
    }

    if (country) {
      allInternships = allInternships.filter(job => 
        job.location?.country?.toLowerCase().includes(country.toLowerCase())
      )
    }

    // Remove duplicates
    const uniqueInternships = allInternships.filter((job, index, self) =>
      index === self.findIndex((j) =>
        j.title === job.title && j.company?.name === job.company?.name
      )
    )

    // Sort by posted date
    uniqueInternships.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))

    // Paginate
    const startIndex = (page - 1) * limit
    const paginatedInternships = uniqueInternships.slice(startIndex, startIndex + limit)

    return NextResponse.json({
      jobs: paginatedInternships,
      totalResults: uniqueInternships.length,
      page,
      totalPages: Math.ceil(uniqueInternships.length / limit),
      hasMore: startIndex + limit < uniqueInternships.length,
    })
  } catch (error) {
    console.error("Internships API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch internships", jobs: [], totalResults: 0 },
      { status: 500 }
    )
  }
}

