"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookmarkIcon, 
  Loader2, 
  Building,
  MapPin,
  DollarSign,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatRelativeTime, formatSalary } from '@/lib/utils'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { toast } from 'sonner'

export default function SavedJobsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const { unsaveJob } = useSavedJobs()
  
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const [removingJobId, setRemovingJobId] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/saved')
    }
  }, [authStatus, router])

  // Fetch saved jobs when user is authenticated
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchSavedJobs()
    }
  }, [authStatus])

  const fetchSavedJobs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/jobs/saved')
      const data = await response.json()

      if (response.ok) {
        // Map the response to extract job data from populated field
        const jobs = data.savedJobs.map(savedJob => ({
          ...savedJob.job,
          savedAt: savedJob.savedAt,
          notes: savedJob.notes,
          savedJobId: savedJob._id
        }))
        setSavedJobs(jobs)
      } else {
        setError(data.error || 'Failed to fetch saved jobs')
        toast.error(data.error || 'Failed to fetch saved jobs')
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      setError('Failed to load saved jobs. Please try again.')
      toast.error('Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (job) => {
    if (!job.externalId) return
    
    setRemovingJobId(job.externalId)
    
    try {
      const result = await unsaveJob(job.externalId)
      
      if (result.success) {
        // Remove from local state
        setSavedJobs(prev => prev.filter(j => j.externalId !== job.externalId))
      }
    } catch (error) {
      console.error('Error removing job:', error)
      toast.error('Failed to remove job')
    } finally {
      setRemovingJobId(null)
    }
  }

  // Show loading spinner while checking auth or fetching jobs
  if (authStatus === 'loading' || (authStatus === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Don't render anything if not authenticated (redirect is happening)
  if (authStatus !== 'authenticated') {
    return null
  }

  // Filter jobs based on search
  const filteredJobs = savedJobs.filter(job =>
    job.title?.toLowerCase().includes(search.toLowerCase()) ||
    job.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
    job.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
    job.location?.country?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Saved Jobs</h1>
              <p className="text-neutral-600">
                {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
              </p>
            </div>
            <Link href="/jobs">
              <Button>Browse More Jobs</Button>
            </Link>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSavedJobs}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        {savedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search saved jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        )}

        {/* Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.externalId || job.savedJobId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {job.company?.logo ? (
                          <img 
                            src={job.company.logo} 
                            alt={job.company?.name || 'Company'} 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building className="h-7 w-7 text-neutral-400" />
                        )}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-neutral-600 mb-2">
                          {job.company?.name || 'Company name not available'}
                        </p>
                        
                        {/* Job Details */}
                        <div className="flex flex-wrap gap-3 text-sm text-neutral-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {job.location?.city && job.location?.country 
                              ? `${job.location.city}, ${job.location.country}`
                              : job.location?.country || job.location?.city || 'Remote'}
                          </span>
                          
                          {(job.salary?.min || job.salary?.max) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 flex-shrink-0" />
                              {formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}
                            </span>
                          )}
                          
                          {job.savedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              Saved {formatRelativeTime(job.savedAt)}
                            </span>
                          )}
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {job.type || 'Full-time'}
                          </Badge>
                          {job.location?.isRemote && (
                            <Badge variant="info">Remote</Badge>
                          )}
                          {job.experienceLevel && (
                            <Badge variant="outline">
                              {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                            </Badge>
                          )}
                        </div>
                        
                        {/* Notes if any */}
                        {job.notes && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-900">
                              <strong>Notes:</strong> {job.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Link href={`/jobs/${encodeURIComponent(job.externalId)}`}>
                          <Button variant="outline" className="w-full sm:w-auto">
                            View Details
                          </Button>
                        </Link>
                        
                        {job.applyUrl && (
                          <a 
                            href={job.applyUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                          >
                            <Button className="gap-2 w-full">
                              Apply
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-neutral-400 hover:text-destructive"
                          onClick={() => handleRemove(job)}
                          disabled={removingJobId === job.externalId}
                        >
                          {removingJobId === job.externalId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BookmarkIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {search ? 'No jobs match your search' : 'No saved jobs yet'}
              </h3>
              <p className="text-neutral-500 mb-4">
                {search 
                  ? 'Try adjusting your search terms' 
                  : 'Start saving jobs to build your collection'}
              </p>
              {search ? (
                <Button variant="outline" onClick={() => setSearch('')}>
                  Clear Search
                </Button>
              ) : (
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Refresh Button */}
        {savedJobs.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={fetchSavedJobs}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}