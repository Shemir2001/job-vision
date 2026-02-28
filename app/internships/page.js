"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Loader2, 
  GraduationCap, 
  Building, 
  Clock, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { countries } from '@/lib/job-apis'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

function InternshipsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [internships, setInternships] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [country, setCountry] = useState(searchParams.get('country') || 'all')
  const [remote, setRemote] = useState(searchParams.get('remote') === 'true')
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1)

  useEffect(() => {
    fetchInternships()
  }, [page])

  const fetchInternships = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (country) params.set('country', country)
      if (remote) params.set('remote', 'true')
      params.set('page', page.toString())
      params.set('limit', '20')

      const response = await fetch(`/api/internships?${params}`)
      const data = await response.json()
      
      setInternships(data.jobs || [])
      setTotalResults(data.totalResults || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching internships:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchInternships()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-amber-50 border-b">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-4">
              <GraduationCap className="h-4 w-4" />
              For Students & Fresh Graduates
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Find Your Dream Internship
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Kickstart your career with hands-on experience at top companies worldwide. 
              Explore thousands of internship opportunities.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  placeholder="Search internships..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-12 bg-white"
                />
              </div>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="md:w-48 h-12 bg-white">
                  <MapPin className="h-4 w-4 mr-2 text-neutral-400" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {countries
  .filter(c => c.code && c.code.trim() !== "")
  .map((c) => (
    <SelectItem key={c.code} value={c.code}>
      {c.flag} {c.name}
    </SelectItem>
))}

                </SelectContent>
              </Select>
              <Button type="submit" size="lg" className="h-12 bg-amber-600 hover:bg-amber-700">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </form>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Checkbox
                  id="remote-internships"
                  checked={remote}
                  onCheckedChange={(checked) => {
                    setRemote(checked)
                    setPage(1)
                    fetchInternships()
                  }}
                />
                <label htmlFor="remote-internships" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  Virtual/Remote Only
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {query ? `Internships for "${query}"` : 'Latest Internships'}
            </h2>
            <p className="text-neutral-500">
              {loading ? 'Searching...' : `${totalResults} internships found`}
            </p>
          </div>
        </div>

        {/* Internship Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : internships.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {internships.map((internship, index) => (
              <motion.div
                key={internship.externalId || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/jobs/${encodeURIComponent(internship.externalId || index)}`}>
                  <Card className="job-card h-full hover:border-amber-200 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {internship.company?.logo ? (
                            <img 
                              src={internship.company.logo} 
                              alt={internship.company?.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building className="h-7 w-7 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg text-neutral-900 mb-1">
                                {internship.title}
                              </h3>
                              <p className="text-neutral-600 mb-2">
                                {internship.company?.name}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0"
                              onClick={(e) => {
                                e.preventDefault()
                              }}
                            >
                              <Bookmark className="h-5 w-5 text-neutral-400" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-3 mb-3 text-sm text-neutral-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {internship.location?.city || internship.location?.country || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {formatRelativeTime(internship.postedAt)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-amber-100 text-amber-700 border-0">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              Internship
                            </Badge>
                            {internship.location?.isRemote && (
                              <Badge variant="info">
                                <Laptop className="h-3 w-3 mr-1" />
                                Remote
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              via {internship.source}
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
            <GraduationCap className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No internships found</h3>
            <p className="text-neutral-500 mb-4">Try adjusting your search criteria</p>
            <Button onClick={() => {
              setQuery('')
              setCountry('')
              setRemote(false)
              setPage(1)
              fetchInternships()
            }}>
              Clear Filters
            </Button>
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

        {/* Info Banners */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-emerald-900 mb-2">
                🎓 Tips for Landing Your First Internship
              </h3>
              <ul className="space-y-2 text-emerald-700">
                <li>• Tailor your resume for each application</li>
                <li>• Highlight relevant coursework and projects</li>
                <li>• Prepare for behavioral interview questions</li>
                <li>• Network with alumni and professionals</li>
              </ul>
              <Link href="/ai/cv-analyzer">
                <Button variant="outline" className="mt-4 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                  Analyze Your Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-violet-900 mb-2">
                💼 Looking for Entry-Level Jobs?
              </h3>
              <p className="text-violet-700 mb-4">
                If you are ready to start your full-time career, explore our entry-level 
                job listings designed for recent graduates.
              </p>
              <Link href="/jobs?experience=entry">
                <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-100">
                  Browse Entry-Level Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function InternshipsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    }>
      <InternshipsContent />
    </Suspense>
  )
}

