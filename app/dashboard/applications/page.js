"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Loader2, 
  Building,
  MapPin,
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'

const statusConfig = {
  applied: { label: 'Applied', color: 'bg-primary-100 text-primary-700', icon: FileText },
  viewed: { label: 'Viewed', color: 'bg-amber-100 text-amber-700', icon: Eye },
  shortlisted: { label: 'Shortlisted', color: 'bg-cyan-100 text-cyan-700', icon: CheckCircle },
  interview: { label: 'Interview', color: 'bg-violet-100 text-violet-700', icon: Clock },
  offered: { label: 'Offered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-neutral-100 text-neutral-700', icon: XCircle },
}

// Mock applications data
const mockApplications = [
  {
    id: '1',
    job: {
      title: 'Senior Software Engineer',
      company: { name: 'TechCorp Inc', logo: null },
      location: { city: 'San Francisco', country: 'USA', isRemote: true }
    },
    status: 'interview',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    aiMatchScore: 85,
    interviews: [{ scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), type: 'video' }]
  },
  {
    id: '2',
    job: {
      title: 'Frontend Developer',
      company: { name: 'StartupXYZ', logo: null },
      location: { city: 'New York', country: 'USA', isRemote: false }
    },
    status: 'viewed',
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    aiMatchScore: 78,
    viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    job: {
      title: 'Full Stack Developer',
      company: { name: 'BigCo', logo: null },
      location: { city: 'Remote', country: 'Worldwide', isRemote: true }
    },
    status: 'applied',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    aiMatchScore: 72
  },
  {
    id: '4',
    job: {
      title: 'React Developer',
      company: { name: 'Innovation Labs', logo: null },
      location: { city: 'London', country: 'UK', isRemote: true }
    },
    status: 'offered',
    appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    aiMatchScore: 92,
    offeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    job: {
      title: 'Backend Engineer',
      company: { name: 'DataSystems', logo: null },
      location: { city: 'Berlin', country: 'Germany', isRemote: false }
    },
    status: 'rejected',
    appliedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    aiMatchScore: 65,
    rejectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
]

export default function ApplicationsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState(mockApplications)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/applications')
    }
  }, [authStatus, router])

  if (authStatus === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = app.job.title.toLowerCase().includes(search.toLowerCase()) ||
                          app.job.company.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['applied', 'viewed', 'shortlisted', 'interview'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offered').length,
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Applications</h1>
          <p className="text-neutral-600">Track and manage your job applications</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-neutral-900">{stats.total}</p>
              <p className="text-sm text-neutral-500">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary-600">{stats.active}</p>
              <p className="text-sm text-neutral-500">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-violet-600">{stats.interviews}</p>
              <p className="text-sm text-neutral-500">Interviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.offers}</p>
              <p className="text-sm text-neutral-500">Offers</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app, index) => {
                const status = statusConfig[app.status]
                return (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Company Logo */}
                        <div className="w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          {app.job.company.logo ? (
                            <img src={app.job.company.logo} alt="" className="w-full h-full object-contain rounded-xl" />
                          ) : (
                            <Building className="h-7 w-7 text-neutral-400" />
                          )}
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg text-neutral-900">
                                {app.job.title}
                              </h3>
                              <p className="text-neutral-600">{app.job.company.name}</p>
                              <div className="flex items-center gap-3 mt-2 text-sm text-neutral-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {app.job.location.city}, {app.job.location.country}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Applied {formatRelativeTime(app.appliedAt)}
                                </span>
                              </div>
                            </div>

                            {/* Status & Score */}
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={status.color}>
                                <status.icon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                              {app.aiMatchScore && (
                                <Badge variant="outline" className="text-primary-600">
                                  {app.aiMatchScore}% Match
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Interview Info */}
                          {app.status === 'interview' && app.interviews?.[0] && (
                            <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-200">
                              <p className="text-sm font-medium text-violet-800">
                                📅 Interview Scheduled
                              </p>
                              <p className="text-sm text-violet-600">
                                {new Date(app.interviews[0].scheduledAt).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {' - '}
                                {app.interviews[0].type === 'video' ? 'Video Call' : 'In-person'}
                              </p>
                            </div>
                          )}

                          {/* Offer Info */}
                          {app.status === 'offered' && (
                            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <p className="text-sm font-medium text-emerald-800">
                                🎉 Congratulations! You received an offer
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                  Accept Offer
                                </Button>
                                <Button size="sm" variant="outline">
                                  Negotiate
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col gap-2">
                          <Link href={`/jobs/${app.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Job
                            </Button>
                          </Link>
                          <Link href={`/ai/interview-prep?job=${app.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Prep
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No applications found</h3>
                <p className="text-neutral-500 mb-4">
                  {search || filter !== 'all' 
                    ? 'Try adjusting your filters'
                    : "You haven't applied to any jobs yet"
                  }
                </p>
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}



