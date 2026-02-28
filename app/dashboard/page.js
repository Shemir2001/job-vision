"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, MapPin } from 'lucide-react'
import { 
  User, 
  Briefcase, 
  BookmarkIcon, 
  FileText, 
  Settings, 
  TrendingUp,
  Target,
  Award,
  Bell,
  ChevronRight,
  Loader2,
  Upload,
  Sparkles,
  Brain,
  Clock,
  CheckCircle,
  Eye,
  XCircle,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, formatRelativeTime } from '@/lib/utils'

const quickActions = [
  { icon: Upload, label: 'Upload Resume', href: '/ai/cv-analyzer', color: 'bg-primary-600' },
  { icon: Sparkles, label: 'Get AI Recommendations', href: '/jobs', color: 'bg-violet-600' },
  { icon: Brain, label: 'Interview Prep', href: '/ai/interview-prep', color: 'bg-amber-600' },
  { icon: FileText, label: 'Cover Letter', href: '/ai/cover-letter', color: 'bg-emerald-600' },
]

const applicationStatuses = [
  { status: 'applied', label: 'Applied', color: 'bg-primary-100 text-primary-700', icon: FileText },
  { status: 'viewed', label: 'Viewed', color: 'bg-amber-100 text-amber-700', icon: Eye },
  { status: 'interview', label: 'Interview', color: 'bg-violet-100 text-violet-700', icon: Clock },
  { status: 'offered', label: 'Offered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [savedJobs, setSavedJobs] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [profileStrength, setProfileStrength] = useState(0)
  const [profileStats, setProfileStats] = useState({
    hasName: false,
    hasPhone: false,
    hasLocation: false,
    hasHeadline: false,
    hasBio: false,
    hasResume: false,
    hasProfileImage: false
  })
  
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    profileViews: 0,
    matchScore: 0
  })
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard')
    }
  }, [status, router])
  
  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])
  
  const fetchDashboardData = async () => {
  setLoading(true)
  try {
    // Fetch profile data
    const profileRes = await fetch('/api/user/profile')
    const profileData = await profileRes.json()
    
    if (profileRes.ok) {
      setProfileData(profileData.user)
      calculateProfileStrength(profileData.user)
    }

    // Fetch saved jobs
    const savedJobsRes = await fetch('/api/jobs/saved')
    const savedJobsData = await savedJobsRes.json()
    
    if (savedJobsRes.ok) {
      setSavedJobs(savedJobsData.savedJobs || [])
    }

    // Fetch AI recommended jobs based on profile
    const recommendedJobsRes = await fetch('/api/jobs/recommendations?limit=3')
    const recommendedJobsData = await recommendedJobsRes.json()
    
    if (recommendedJobsRes.ok) {
      setRecentJobs(recommendedJobsData.jobs || [])
    } else {
      // Fallback to regular jobs if recommendations fail
      const jobsRes = await fetch('/api/jobs?limit=3')
      const jobsData = await jobsRes.json()
      setRecentJobs(jobsData.jobs || [])
    }
    
    // Update stats with real data
    setStats({
      applications: applications.length,
      savedJobs: savedJobsData.savedJobs?.length || 0,
      profileViews: profileData.user?.profileViews || 0,
      matchScore: profileStrength || profileData.user?.profileCompleteness || 0
    })
    
    setApplications([])
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    setLoading(false)
  }
}
  const calculateProfileStrength = (user) => {
    const stats = {
      hasName: !!user.name,
      hasPhone: !!user.phone,
      hasLocation: !!user.location?.country, 
      hasHeadline: !!user.headline,
      hasBio: !!user.bio,
      hasResume: !!user.resume?.url,
      hasProfileImage: !!user.image
    }
    
    setProfileStats(stats)
    
    // Calculate percentage (7 total fields)
    const completedFields = Object.values(stats).filter(Boolean).length
    const strength = Math.round((completedFields / 7) * 100)
    setProfileStrength(strength)
  }
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const ProfileCheckItem = ({ completed, label, link }) => (
    <Link href={link}>
      <div className="flex items-center gap-2 text-sm hover:text-primary-600 transition-colors cursor-pointer">
        {completed ? (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-neutral-400" />
        )}
        <span className={completed ? '' : 'text-neutral-400'}>
          {label}
        </span>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={session.user?.image} />
                <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                  {getInitials(session.user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Welcome back, {session.user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-neutral-600">
                  Here's what's happening with your job search
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/jobs">
                <Button>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <Link key={index} href={action.href}>
                        <div className="p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer text-center">
                          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-neutral-700">{action.label}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats */}
          {/* Stats */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{loading ? '-' : stats.applications}</p>
            <p className="text-sm text-neutral-500">Applications</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <BookmarkIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{loading ? '-' : stats.savedJobs}</p>
            <p className="text-sm text-neutral-500">Saved Jobs</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Eye className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{loading ? '-' : stats.profileViews}</p>
            <p className="text-sm text-neutral-500">Profile Views</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <Target className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{loading ? '-' : profileStrength}%</p>
            <p className="text-sm text-neutral-500">Profile Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</motion.div>

            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Recent Applications</CardTitle>
                  <Link href="/dashboard/applications">
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((app) => {
                        const statusInfo = applicationStatuses.find(s => s.status === app.status)
                        return (
                          <div key={app.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center">
                                <Building className="h-5 w-5 text-neutral-500" />
                              </div>
                              <div>
                                <p className="font-medium">{app.jobTitle}</p>
                                <p className="text-sm text-neutral-500">{app.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={statusInfo?.color}>
                                {statusInfo?.label}
                              </Badge>
                              <span className="text-sm text-neutral-400">
                                {formatRelativeTime(app.appliedAt)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <p className="text-neutral-500 mb-4">No applications yet</p>
                      <Link href="/jobs">
                        <Button>Start Applying</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommended Jobs */}
           {/* Recommended Jobs */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
>
  <Card>
    <CardHeader className="flex-row items-center justify-between">
      <div>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          AI Recommendations
        </CardTitle>
        <CardDescription>Jobs matched to your profile</CardDescription>
      </div>
      <Link href="/jobs">
        <Button variant="ghost" size="sm">
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      ) : recentJobs.length > 0 ? (
        <div className="space-y-4">
          {recentJobs.slice(0, 3).map((job, index) => (
            <Link key={job.externalId || index} href={`/jobs/${encodeURIComponent(job.externalId || index)}`}>
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border">
                    {job.company?.logo ? (
                      <img src={job.company.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Building className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-neutral-500">{job.company?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {job.matchScore ? (
                    <Badge 
                      className={
                        job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        job.matchScore >= 60 ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }
                    >
                      {job.matchScore}% Match
                    </Badge>
                  ) : (
                    <Badge variant="info">New</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600 mb-2">No recommendations yet</p>
          <p className="text-sm text-neutral-500 mb-4">
            Complete your profile to get personalized job recommendations
          </p>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              Complete Profile
            </Button>
          </Link>
        </div>
      )}
    </CardContent>
  </Card>
</motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
          {/* Profile Completeness */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Award className="h-5 w-5 text-amber-500" />
        Profile Strength
      </CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600">Completeness</span>
              <span className="font-medium text-lg">{profileStrength}%</span>
            </div>
            <Progress value={profileStrength} className="h-2" />
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            Complete your profile to increase visibility to employers
          </p>
          <div className="space-y-2">
            <ProfileCheckItem
              completed={profileStats.hasName}
              label="Add your full name"
              link="/dashboard/settings"
            />
            <ProfileCheckItem
              completed={profileStats.hasPhone}
              label="Add phone number"
              link="/dashboard/settings"
            />
            <ProfileCheckItem
              completed={profileStats.hasLocation}
              label="Add your location"
              link="/dashboard/settings"
            />
            <ProfileCheckItem
              completed={profileStats.hasHeadline}
              label="Add professional headline"
              link="/dashboard/settings"
            />
            <ProfileCheckItem
              completed={profileStats.hasBio}
              label="Write a bio"
              link="/dashboard/settings"
            />
            <ProfileCheckItem
              completed={profileStats.hasResume}
              label="Upload your resume"
              link="/dashboard/settings"
            />
            <ProfileCheckItem
              completed={profileStats.hasProfileImage}
              label="Upload profile picture"
              link="/dashboard/settings"
            />
          </div>
          <Link href="/dashboard/settings">
            <Button variant="outline" className="w-full mt-4">
              Complete Profile
            </Button>
          </Link>
        </>
      )}
    </CardContent>
  </Card>
</motion.div>

            {/* Job Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Job Alerts
                  </CardTitle>
                </CardHeader>
              <CardContent>
  {loading ? (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
    </div>
  ) : profileData?.preferences?.emailAlerts ? (
    <>
      <p className="text-sm text-neutral-500 mb-4">
        You're receiving {profileData.preferences.alertFrequency || 'daily'} job alerts
      </p>
      <div className="space-y-3">
        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <p className="font-medium text-sm text-emerald-900">Alerts Active</p>
          </div>
          <p className="text-xs text-emerald-700">
            Frequency: {profileData.preferences.alertFrequency || 'daily'}
          </p>
        </div>
        {profileData.preferences.remotePreference && profileData.preferences.remotePreference !== 'any' && (
          <div className="p-3 bg-neutral-50 rounded-lg">
            <p className="font-medium text-sm">Work Arrangement</p>
            <p className="text-xs text-neutral-500 capitalize">
              {profileData.preferences.remotePreference}
            </p>
          </div>
        )}
      </div>
      <Link href="/dashboard/settings?tab=preferences">
        <Button variant="outline" className="w-full mt-4">
          Manage Alerts
        </Button>
      </Link>
    </>
  ) : (
    <>
      <p className="text-sm text-neutral-500 mb-4">
        Get notified when new jobs match your preferences
      </p>
      <div className="text-center py-4">
        <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm text-neutral-600 mb-4">Job alerts are turned off</p>
      </div>
      <Link href="/dashboard/settings?tab=preferences">
        <Button variant="outline" className="w-full">
          Enable Alerts
        </Button>
      </Link>
    </>
  )}
</CardContent>
              </Card>
            </motion.div>

            {/* AI Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-primary-50 border-primary-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-600 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary-900">AI Career Coach</p>
                      <p className="text-sm text-primary-700">Get personalized advice</p>
                    </div>
                  </div>
                  <Link href="/ai/career-coach">
                    <Button className="w-full">Chat with AI Coach</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}



