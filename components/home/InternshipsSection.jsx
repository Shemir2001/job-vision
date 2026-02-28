"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { GraduationCap, MapPin, Building, Clock, ArrowRight, Loader2, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'

export default function InternshipsSection() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  useEffect(() => {
    async function fetchInternships() {
      try {
        const response = await fetch('/api/internships?limit=4')
        const data = await response.json()
        setInternships(data.jobs || [])
      } catch (error) {
        console.error('Error fetching internships:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInternships()
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-4">
              <GraduationCap className="h-4 w-4" />
              For Students & Graduates
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
              Latest Internships
            </h2>
            <p className="text-neutral-600">
              Kickstart your career with hands-on experience at top companies
            </p>
          </div>
          <Link href="/internships" className="mt-4 md:mt-0">
            <Button variant="outline" className="gap-2">
              View All Internships
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Internships Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : internships.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {internships.map((internship, index) => (
              <motion.div
                key={internship.externalId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/jobs/${internship.externalId || index}`}>
                  <Card className="job-card h-full hover:border-amber-200 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                          {internship.company?.logo ? (
                            <img 
                              src={internship.company.logo} 
                              alt={internship.company?.name}
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <Building className="h-7 w-7 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                            {internship.title}
                          </h3>
                          <p className="text-neutral-600 mb-3">
                            {internship.company?.name}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                              <MapPin className="h-4 w-4" />
                              {internship.location?.city || internship.location?.country || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                              <Clock className="h-4 w-4" />
                              {formatRelativeTime(internship.postedAt)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="warning" className="bg-amber-100 text-amber-700 border-0">
                              Internship
                            </Badge>
                            {internship.location?.isRemote && (
                              <Badge variant="info" className="text-xs">
                                <Laptop className="h-3 w-3 mr-1" />
                                Remote
                              </Badge>
                            )}
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
          <div className="text-center py-10 bg-neutral-50 rounded-2xl">
            <GraduationCap className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 mb-4">Internship listings coming soon!</p>
            <Link href="/jobs?type=internship">
              <Button variant="outline">Browse Jobs Instead</Button>
            </Link>
          </div>
        )}

        {/* Virtual Internship Banner */}
        <motion.div
          className="mt-12 grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center gap-3 mb-3">
              <Laptop className="h-6 w-6 text-emerald-600" />
              <h3 className="font-semibold text-lg text-emerald-900">Virtual Internships</h3>
            </div>
            <p className="text-emerald-700 mb-4">
              Work remotely with top companies from anywhere in the world. Gain valuable experience without relocating.
            </p>
            <Link href="/internships?remote=true">
              <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                Explore Virtual Internships
              </Button>
            </Link>
          </div>
          <div className="bg-violet-50 rounded-2xl p-6 border border-violet-200">
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="h-6 w-6 text-violet-600" />
              <h3 className="font-semibold text-lg text-violet-900">For Fresh Graduates</h3>
            </div>
            <p className="text-violet-700 mb-4">
              Entry-level positions designed for recent graduates. No experience required, just enthusiasm!
            </p>
            <Link href="/jobs?experience=entry">
              <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-100">
                Entry-Level Jobs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

