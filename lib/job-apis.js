// Job API Integration Service - SIMPLIFIED VERSION
// Only Remotive (2000+ jobs) + Arbeitnow (1000 jobs)
// Fixed search filtering

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ====================================
// REMOTIVE API - Target 2000+ jobs
// ====================================
export async function fetchRemotiveJobs(params = {}) {
  const { category = "", search = "" } = params

  try {
    const queryParams = new URLSearchParams()
    if (category) queryParams.append("category", category)
    if (search) queryParams.append("search", search)

    const response = await fetch(
      `https://remotive.com/api/remote-jobs?${queryParams}`,
      { 
        next: { revalidate: 1800 }, // 30 min cache
        cache: 'force-cache'
      }
    )

    if (!response.ok) {
      console.error(`Remotive API error: ${response.status}`)
      return { jobs: [], totalResults: 0, source: "remotive" }
    }

    const data = await response.json()

    return {
      jobs: data.jobs?.map(transformRemotiveJob) || [],
      totalResults: data.jobs?.length || 0,
      source: "remotive",
    }
  } catch (error) {
    console.error("Remotive API error:", error)
    return { jobs: [], totalResults: 0, source: "remotive" }
  }
}

// Fetch ALL Remotive jobs across ALL categories
async function fetchRemotiveAllJobs() {
  console.log('📊 Fetching from REMOTIVE...')
  
  // All Remotive categories
  const categories = [
    "software-dev",
    "customer-support", 
    "design",
    "sales",
    "marketing",
    "product",
    "business",
    "data",
    "devops",
    "finance",
    "legal",
    "management",
    "qa",
    "writing",
    "all-others"
  ]

  const allJobs = []
  
  // Fetch all categories in parallel
  const promises = categories.map(category => 
    fetchRemotiveJobs({ category })
  )
  
  const results = await Promise.allSettled(promises)
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.jobs) {
      const jobs = result.value.jobs
      allJobs.push(...jobs)
      console.log(`  ✅ ${categories[index]}: ${jobs.length} jobs`)
    }
  })

  // Remove duplicates by ID
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.externalId, job])).values()
  )

  console.log(`  ✅ Remotive TOTAL: ${uniqueJobs.length} unique jobs`)
  return uniqueJobs
}

function transformRemotiveJob(job) {
  return {
    externalId: `remotive_${job.id}`,
    source: "remotive",
    title: job.title,
    company: {
      name: job.company_name,
      logo: job.company_logo,
    },
    location: {
      city: null,
      country: job.candidate_required_location || "Worldwide",
      isRemote: true,
    },
    description: job.description,
    salary: {
      min: job.salary ? parseInt(job.salary.split("-")[0]?.replace(/\D/g, "")) : null,
      max: job.salary ? parseInt(job.salary.split("-")[1]?.replace(/\D/g, "")) : null,
      currency: "USD",
    },
    type: job.job_type?.toLowerCase().replace(" ", "-") || "full-time",
    category: job.category,
    applyUrl: job.url,
    postedAt: new Date(job.publication_date),
    tags: job.tags || [],
  }
}

// ====================================
// ARBEITNOW API - Target 1000 jobs
// ====================================
export async function fetchArbeitnowJobs(params = {}) {
  const { page = 1 } = params

  try {
    const response = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?page=${page}`,
      { 
        next: { revalidate: 1800 },
        cache: 'force-cache'
      }
    )

    if (!response.ok) {
      console.error(`Arbeitnow API error: ${response.status}`)
      return { jobs: [], totalResults: 0, page, source: "arbeitnow" }
    }

    const data = await response.json()

    return {
      jobs: data.data?.map(transformArbeitnowJob) || [],
      totalResults: data.data?.length || 0,
      page,
      source: "arbeitnow",
      hasMore: data.links?.next != null,
    }
  } catch (error) {
    console.error("Arbeitnow API error:", error)
    return { jobs: [], totalResults: 0, page, source: "arbeitnow" }
  }
}

// Fetch multiple pages from Arbeitnow
async function fetchArbeitnowAllJobs(maxJobs = 1000) {
  console.log('📊 Fetching from ARBEITNOW...')
  
  const resultsPerPage = 20
  const maxPages = Math.ceil(maxJobs / resultsPerPage) // 50 pages for 1000 jobs

  const allJobs = []
  let hasMore = true
  
  for (let page = 1; page <= maxPages && hasMore; page++) {
    const result = await fetchArbeitnowJobs({ page })
    
    if (result.jobs && result.jobs.length > 0) {
      allJobs.push(...result.jobs)
      hasMore = result.hasMore !== false
      
      if (page % 10 === 0) {
        console.log(`  📄 Page ${page}: ${allJobs.length} jobs fetched so far`)
      }
    } else {
      hasMore = false
    }

    // Small delay to be polite
    if (hasMore && page < maxPages) {
      await delay(50)
    }
    
    // Stop if we've reached our target
    if (allJobs.length >= maxJobs) {
      break
    }
  }

  console.log(`  ✅ Arbeitnow TOTAL: ${allJobs.length} jobs`)
  return allJobs
}

function transformArbeitnowJob(job) {
  return {
    externalId: `arbeitnow_${job.slug}`,
    source: "arbeitnow",
    title: job.title,
    company: {
      name: job.company_name,
      logo: job.company_logo,
    },
    location: {
      city: job.location,
      country: "Germany",
      isRemote: job.remote || false,
    },
    description: job.description,
    type: "full-time",
    category: job.tags?.[0] || "General",
    applyUrl: job.url,
    postedAt: new Date(job.created_at * 1000),
    tags: job.tags || [],
  }
}

// ================================================================
// MAIN FUNCTION - Fetch jobs from Remotive + Arbeitnow ONLY
// ================================================================
export async function fetchAllJobs(params = {}) {
  const { country = '', query = '', category = '' } = params
  
  console.log('\n🚀 Starting job fetch...')
  console.log(`🔍 Search query: "${query || 'all jobs'}"`)
  console.log(`📍 Country filter: "${country || 'all'}"`)
  console.log(`📂 Category filter: "${category || 'all'}"`)
  const startTime = Date.now()

  // Fetch from both sources in parallel
  const [remotiveJobs, arbeitnowJobs] = await Promise.all([
    fetchRemotiveAllJobs(),
    fetchArbeitnowAllJobs(1000)
  ])

  // Combine all jobs
  const allJobs = [...remotiveJobs, ...arbeitnowJobs]

  console.log(`\n📦 JOBS FETCHED (BEFORE FILTERING):`)
  console.log(`  Remotive: ${remotiveJobs.length} jobs`)
  console.log(`  Arbeitnow: ${arbeitnowJobs.length} jobs`)
  console.log(`  TOTAL: ${allJobs.length} jobs`)

  // ====================================
  // APPLY FILTERS
  // ====================================
  let filteredJobs = allJobs

  // 1. SEARCH QUERY FILTER (if provided)
  if (query && query.trim()) {
    const searchTerms = query.toLowerCase().trim().split(' ')
    
    filteredJobs = filteredJobs.filter(job => {
      const searchableText = [
        job.title,
        job.company?.name,
        job.description,
        job.category,
        ...(job.tags || [])
      ].join(' ').toLowerCase()

      // Check if ALL search terms appear in the job
      return searchTerms.every(term => searchableText.includes(term))
    })
    
    console.log(`\n🔍 After search query "${query}": ${filteredJobs.length} jobs`)
  }

  // 2. CATEGORY FILTER (if provided)
  if (category && category !== 'all') {
    const categoryLower = category.toLowerCase().replace('-jobs', '')
    
    filteredJobs = filteredJobs.filter(job => {
      const jobCategory = (job.category || '').toLowerCase()
      const jobTags = (job.tags || []).map(t => t.toLowerCase()).join(' ')
      
      return jobCategory.includes(categoryLower) || jobTags.includes(categoryLower)
    })
    
    console.log(`\n📂 After category "${category}": ${filteredJobs.length} jobs`)
  }

  // 3. COUNTRY FILTER (if provided and not 'all')
  if (country && country !== 'all') {
    const countryLower = country.toLowerCase()
    
    filteredJobs = filteredJobs.filter(job => {
      // For Remotive (all remote jobs), be very inclusive
      if (job.source === 'remotive') {
        const location = (job.location?.country || '').toLowerCase()
        
        // Keep if:
        // - Worldwide
        // - Empty/not specified (available everywhere)
        // - Matches the country
        // - Contains country name
        if (!location || location === 'worldwide') return true
        if (location.includes(countryLower)) return true
        
        // Regional matches
        if (countryLower === 'us' && location.includes('america')) return true
        if (countryLower === 'us' && location.includes('usa')) return true
        if (countryLower === 'us' && location.includes('united states')) return true
        if (['gb', 'de', 'fr', 'nl', 'pl', 'at', 'ch', 'ie'].includes(countryLower) && location.includes('europe')) return true
        if (['in', 'sg', 'jp'].includes(countryLower) && location.includes('asia')) return true
        
        // Default: keep remote jobs
        return true
      }
      
      // For Arbeitnow (Germany-focused)
      if (job.source === 'arbeitnow') {
        // Only keep if country is Germany/Europe-related
        if (['de', 'at', 'ch'].includes(countryLower)) return true
        if (countryLower === 'all') return true
        
        // If remote, keep it
        if (job.location?.isRemote) return true
        
        return false
      }
      
      return true
    })
    
    console.log(`\n🌍 After country "${country}": ${filteredJobs.length} jobs`)
  }

  console.log(`\n📦 FINAL RESULTS BY SOURCE:`)
  const finalBySource = {
    remotive: filteredJobs.filter(j => j.source === 'remotive').length,
    arbeitnow: filteredJobs.filter(j => j.source === 'arbeitnow').length,
  }
  console.log(`  Remotive: ${finalBySource.remotive} jobs`)
  console.log(`  Arbeitnow: ${finalBySource.arbeitnow} jobs`)

  // Remove duplicates (just in case)
  const uniqueJobsMap = new Map()
  filteredJobs.forEach(job => {
    if (!uniqueJobsMap.has(job.externalId)) {
      uniqueJobsMap.set(job.externalId, job)
    }
  })
  const uniqueJobs = Array.from(uniqueJobsMap.values())

  // Sort by posted date (newest first)
  uniqueJobs.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))

  const endTime = Date.now()
  console.log(`\n✨ FINAL: ${uniqueJobs.length} unique jobs`)
  console.log(`⏱️ Total fetch time: ${((endTime - startTime) / 1000).toFixed(2)}s\n`)

  return {
    jobs: uniqueJobs,
    totalResults: uniqueJobs.length,
    fetchTime: endTime - startTime,
    breakdown: {
      remotive: uniqueJobs.filter(j => j.source === 'remotive').length,
      arbeitnow: uniqueJobs.filter(j => j.source === 'arbeitnow').length,
    }
  }
}

// Job categories for filtering
export const jobCategories = [
  { value: "it-jobs", label: "IT & Technology" },
  { value: "software-dev", label: "Software Development" },
  { value: "engineering-jobs", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "customer-support", label: "Customer Support" },
  { value: "product", label: "Product Management" },
  { value: "data", label: "Data Science" },
  { value: "devops", label: "DevOps" },
  { value: "finance", label: "Finance" },
  { value: "management", label: "Management" },
  { value: "qa", label: "QA & Testing" },
  { value: "writing", label: "Writing & Content" },
]

// Countries supported
// Countries supported - with flag images
export const countries = [
  { code: "us", name: "United States", flag: "🇺🇸", flagUrl: "https://flagcdn.com/w80/us.png" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧", flagUrl: "https://flagcdn.com/w80/gb.png" },
  { code: "ca", name: "Canada", flag: "🇨🇦", flagUrl: "https://flagcdn.com/w80/ca.png" },
  { code: "au", name: "Australia", flag: "🇦🇺", flagUrl: "https://flagcdn.com/w80/au.png" },
  { code: "de", name: "Germany", flag: "🇩🇪", flagUrl: "https://flagcdn.com/w80/de.png" },
  { code: "fr", name: "France", flag: "🇫🇷", flagUrl: "https://flagcdn.com/w80/fr.png" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱", flagUrl: "https://flagcdn.com/w80/nl.png" },
  { code: "in", name: "India", flag: "🇮🇳", flagUrl: "https://flagcdn.com/w80/in.png" },
  { code: "sg", name: "Singapore", flag: "🇸🇬", flagUrl: "https://flagcdn.com/w80/sg.png" },
  { code: "br", name: "Brazil", flag: "🇧🇷", flagUrl: "https://flagcdn.com/w80/br.png" },
  { code: "nz", name: "New Zealand", flag: "🇳🇿", flagUrl: "https://flagcdn.com/w80/nz.png" },
  { code: "za", name: "South Africa", flag: "🇿🇦", flagUrl: "https://flagcdn.com/w80/za.png" },
  { code: "pl", name: "Poland", flag: "🇵🇱", flagUrl: "https://flagcdn.com/w80/pl.png" },
  { code: "at", name: "Austria", flag: "🇦🇹", flagUrl: "https://flagcdn.com/w80/at.png" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭", flagUrl: "https://flagcdn.com/w80/ch.png" },
  { code: "jp", name: "Japan", flag: "🇯🇵", flagUrl: "https://flagcdn.com/w80/jp.png" },
  { code: "ae", name: "UAE", flag: "🇦🇪", flagUrl: "https://flagcdn.com/w80/ae.png" },
  { code: "ie", name: "Ireland", flag: "🇮🇪", flagUrl: "https://flagcdn.com/w80/ie.png" },
]