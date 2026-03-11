"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { MapPin, Building, Clock, DollarSign, Bookmark, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeTime, formatSalary } from '@/lib/utils'

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // Refs for impression tracking
  const observerRef = useRef(null)
  const jobCardRefsRef = useRef({})

  /**
   * Initialize sessionStorage for tracking viewed jobs in current session
   */
  const getSessionViewedJobs = useCallback(() => {
    try {
      const viewed = sessionStorage.getItem('viewedJobsFeatured')
      return viewed ? new Set(JSON.parse(viewed)) : new Set()
    } catch (error) {
      console.error('Error reading sessionStorage:', error)
      return new Set()
    }
  }, [])

  const addToSessionViewedJobs = useCallback((jobId) => {
    try {
      const viewed = getSessionViewedJobs()
      viewed.add(jobId)
      sessionStorage.setItem('viewedJobsFeatured', JSON.stringify(Array.from(viewed)))
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
    }
  }, [getSessionViewedJobs])

  const isJobViewedInSession = useCallback((jobId) => {
    return getSessionViewedJobs().has(jobId)
  }, [getSessionViewedJobs])

  /**
   * Track job impression when card enters viewport
   */
  const trackJobImpression = useCallback(async (jobId, jobSource = 'manual') => {
    try {
      // Check if job has already been viewed in this session
      if (isJobViewedInSession(jobId)) {
        return
      }

      // Mark as viewed in sessionStorage
      addToSessionViewedJobs(jobId)

      // Send impression to the increment endpoint
      const response = await fetch('/api/jobs/increment-impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          jobSource,
          type: 'view',
          source: 'featured'
        })
      })

      if (!response.ok) {
        console.error('Failed to track impression:', response.status)
      }
    } catch (error) {
      console.error('Error tracking impression:', error)
    }
  }, [isJobViewedInSession, addToSessionViewedJobs])

  /**
   * Setup IntersectionObserver for job cards
   */
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const jobId = entry.target.getAttribute('data-job-id')
              const jobSource = entry.target.getAttribute('data-job-source') || 'manual'

              if (jobId) {
                // Small delay to ensure card is truly visible
                setTimeout(() => {
                  trackJobImpression(jobId, jobSource)
                }, 100)
              }
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: '100px'
        }
      )
    }

    return () => {
      // Keep observer running
    }
  }, [trackJobImpression])

  /**
   * Observe job cards when they're added
   */
  useEffect(() => {
    if (!observerRef.current || !jobs.length) return

    const timer = setTimeout(() => {
      Object.entries(jobCardRefsRef.current).forEach(([jobId, cardRef]) => {
        if (cardRef && observerRef.current) {
          try {
            observerRef.current.observe(cardRef)
          } catch (error) {
            console.error('Error observing element:', error)
          }
        }
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [jobs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        try {
          observerRef.current.disconnect()
        } catch (error) {
          console.error('Error disconnecting observer:', error)
        }
      }
    }
  }, [])

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs?limit=6&featured=true')
        const data = await response.json()
        setJobs(data.jobs || [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  return (
    <section className="py-20 bg-white dark:bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-foreground mb-2">
              Featured Jobs
            </h2>
            <p className="text-neutral-600 dark:text-muted-foreground">
              Handpicked opportunities from top companies worldwide
            </p>
          </div>
          <Link href="/jobs" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2">
              View All Jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => {
              const jobId = job._id || job.externalId
              return (
                <motion.div
                  key={jobId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  ref={(ref) => {
                    if (ref) jobCardRefsRef.current[jobId] = ref
                  }}
                  data-job-id={jobId}
                  data-job-source={job.source || 'manual'}
                >
                  <Link href={`/jobs/${job.externalId || index}`}>
                    <Card className="job-card h-full hover:border-primary-200 dark:hover:border-primary-700 cursor-pointer">
                      <CardContent className="p-6">
                        {/* Company Logo & Info */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                            {job.company?.logo ? (
                              <img
                                src={job.company.logo}
                                alt={job.company?.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building className="h-6 w-6 text-neutral-400 dark:text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-900 dark:text-foreground truncate">
                              {job.title}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-muted-foreground truncate">
                              {job.company?.name}
                            </p>
                          </div>
                          <button
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-secondary rounded-lg transition-colors"
                            onClick={(e) => {
                              e.preventDefault()
                              // Handle bookmark
                            }}
                          >
                            <Bookmark className="h-5 w-5 text-neutral-400 dark:text-muted-foreground" />
                          </button>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-muted-foreground">
                            <MapPin className="h-4 w-4 text-neutral-400 dark:text-muted-foreground" />
                            <span className="truncate">
                              {job.location?.city || job.location?.country || 'Remote'}
                              {job.location?.isRemote && ' (Remote)'}
                            </span>
                          </div>
                          {(job.salary?.min || job.salary?.max) && (
                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-muted-foreground">
                              <DollarSign className="h-4 w-4 text-neutral-400 dark:text-muted-foreground" />
                              <span>
                                {formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-muted-foreground">
                            <Clock className="h-4 w-4 text-neutral-400 dark:text-muted-foreground" />
                            <span>{formatRelativeTime(job.postedAt)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {job.type || 'Full-time'}
                          </Badge>
                          {job.location?.isRemote && (
                            <Badge variant="info" className="text-xs">
                              Remote
                            </Badge>
                          )}
                          {job.category && (
                            <Badge variant="outline" className="text-xs">
                              {job.category}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500 dark:text-muted-foreground">No featured jobs available at the moment.</p>
            <Link href="/jobs">
              <Button className="mt-4">Browse All Jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}



