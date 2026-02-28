"use client"

import { useEffect, useState, useRef } from 'react'
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
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
              Featured Jobs
            </h2>
            <p className="text-neutral-600">
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
            {jobs.map((job, index) => (
              <motion.div
                key={job.externalId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/jobs/${job.externalId || index}`}>
                  <Card className="job-card h-full hover:border-primary-200 cursor-pointer">
                    <CardContent className="p-6">
                      {/* Company Logo & Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {job.company?.logo ? (
                            <img 
                              src={job.company.logo} 
                              alt={job.company?.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building className="h-6 w-6 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 truncate">
                            {job.title}
                          </h3>
                          <p className="text-sm text-neutral-500 truncate">
                            {job.company?.name}
                          </p>
                        </div>
                        <button 
                          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            // Handle bookmark
                          }}
                        >
                          <Bookmark className="h-5 w-5 text-neutral-400" />
                        </button>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <MapPin className="h-4 w-4 text-neutral-400" />
                          <span className="truncate">
                            {job.location?.city || job.location?.country || 'Remote'}
                            {job.location?.isRemote && ' (Remote)'}
                          </span>
                        </div>
                        {(job.salary?.min || job.salary?.max) && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <DollarSign className="h-4 w-4 text-neutral-400" />
                            <span>
                              {formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Clock className="h-4 w-4 text-neutral-400" />
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-neutral-500">No featured jobs available at the moment.</p>
            <Link href="/jobs">
              <Button className="mt-4">Browse All Jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}



