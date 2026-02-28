"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  Loader2, 
  Briefcase, 
  Building, 
  Clock, 
  DollarSign, 
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Laptop
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { countries, jobCategories } from '@/lib/job-apis'
import { formatRelativeTime, formatSalary } from '@/lib/utils'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function JobsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isJobSaved, toggleSaveJob, loading: savedJobsLoading } = useSavedJobs()
  
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [savingJobId, setSavingJobId] = useState(null)

  // Filter states
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [country, setCountry] = useState(searchParams.get('country') || 'all')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [jobType, setJobType] = useState(searchParams.get('type') || '')
  const [remote, setRemote] = useState(searchParams.get('remote') === 'true')
  const [experience, setExperience] = useState(searchParams.get('experience') || '')
  const [salaryRange, setSalaryRange] = useState([0, 200000])
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    fetchJobs()
  }, [page])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (country && country !== 'all') params.set('country', country)
      if (category && category !== 'all') params.set('category', category)
      if (jobType) params.set('type', jobType)
      if (remote) params.set('remote', 'true')
      if (experience) params.set('experience', experience)
      params.set('page', page.toString())
      params.set('limit', '20')

      const response = await fetch(`/api/jobs?${params}`)
      const data = await response.json()
      
      setJobs(data.jobs || [])
      setTotalResults(data.totalResults || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
    updateURL()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (country && country !== 'all') params.set('country', country)
    if (category && category !== 'all') params.set('category', category)
    if (jobType) params.set('type', jobType)
    if (remote) params.set('remote', 'true')
    if (experience) params.set('experience', experience)
    if (page > 1) params.set('page', page.toString())
    router.push(`/jobs?${params.toString()}`)
  }

  const clearFilters = () => {
    setQuery('')
    setCountry('all')
    setCategory('all')
    setJobType('')
    setRemote(false)
    setExperience('')
    setSalaryRange([0, 200000])
    setPage(1)
    router.push('/jobs')
  }

  const handleSaveJob = async (e, job) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Stop event bubbling
    
    setSavingJobId(job.externalId)
    await toggleSaveJob(job)
    setSavingJobId(null)
  }

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ]

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead' },
    { value: 'executive', label: 'Executive' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                placeholder="Job title, keywords, or company"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="md:w-48">
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-11">
                  <MapPin className="h-4 w-4 mr-2 text-neutral-400" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="h-11">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="h-11 md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : 'hidden'} md:block md:relative md:w-64 flex-shrink-0`}>
            {showFilters && (
              <div className="flex items-center justify-between mb-4 md:hidden">
                <h2 className="font-semibold text-lg">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="bg-white rounded-xl p-5 shadow-sm space-y-6 md:sticky md:top-32">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <Separator />

              {/* Job Type */}
              <div>
                <Label className="font-medium mb-3 block">Job Type</Label>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.value}
                        checked={jobType === type.value}
                        onCheckedChange={(checked) => setJobType(checked ? type.value : '')}
                      />
                      <label htmlFor={type.value} className="text-sm cursor-pointer">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Remote */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={remote}
                  onCheckedChange={setRemote}
                />
                <label htmlFor="remote" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  Remote Only
                </label>
              </div>

              <Separator />

              {/* Experience Level */}
              <div>
                <Label className="font-medium mb-3 block">Experience Level</Label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={level.value}
                        checked={experience === level.value}
                        onCheckedChange={(checked) => setExperience(checked ? level.value : '')}
                      />
                      <label htmlFor={level.value} className="text-sm cursor-pointer">
                        {level.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Category */}
              <div>
                <Label className="font-medium mb-3 block">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {jobCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Salary Range */}
              <div>
                <Label className="font-medium mb-3 block">
                  Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
                </Label>
                <Slider
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  min={0}
                  max={200000}
                  step={10000}
                  className="mt-2"
                />
              </div>

              <Button onClick={handleSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Job Results */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {query ? `Jobs for "${query}"` : 'All Jobs'}
                </h1>
                <p className="text-neutral-500">
                  {loading ? 'Searching...' : `${totalResults.toLocaleString()} jobs found`}
                </p>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Most Recent</SelectItem>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Job Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.externalId || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/jobs/${encodeURIComponent(job.externalId || index)}`}>
                      <Card className="job-card hover:border-primary-200 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {job.company?.logo ? (
                                <img 
                                  src={job.company.logo} 
                                  alt={job.company?.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Building className="h-7 w-7 text-neutral-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                                    {job.title}
                                  </h3>
                                  <p className="text-neutral-600 mb-2">
                                    {job.company?.name}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="flex-shrink-0"
                                  disabled={savingJobId === job.externalId || savedJobsLoading}
                                  onClick={(e) => handleSaveJob(e, job)}
                                >
                                  {savingJobId === job.externalId ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                                  ) : isJobSaved(job.externalId) ? (
                                    <BookmarkCheck className="h-5 w-5 text-primary-600 fill-primary-600" />
                                  ) : (
                                    <Bookmark className="h-5 w-5 text-neutral-400 hover:text-primary-600" />
                                  )}
                                </Button>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 mb-3 text-sm text-neutral-500">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {job.location?.city || job.location?.country || 'Remote'}
                                  {job.location?.isRemote && ' (Remote)'}
                                </div>
                                {(job.salary?.min || job.salary?.max) && (
                                  <div className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4" />
                                    {formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4" />
                                  {formatRelativeTime(job.postedAt)}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">{job.type || 'Full-time'}</Badge>
                                {job.location?.isRemote && (
                                  <Badge variant="info">Remote</Badge>
                                )}
                                {job.experienceLevel && (
                                  <Badge variant="outline">{job.experienceLevel}</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  via {job.source}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl">
                <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No jobs found</h3>
                <p className="text-neutral-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-neutral-500 px-4">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <JobsContent />
    </Suspense>
  )
}