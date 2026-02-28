"use client"

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Bookmark,
  Share2,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Users,
  Globe,
  Sparkles,
  FileText,
  MessageSquare,
  Target,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatRelativeTime, formatSalary } from '@/lib/utils'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { BookmarkCheck } from 'lucide-react'
export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [matchScore, setMatchScore] = useState(null)
const { data: session } = useSession()
const [saving, setSaving] = useState(false)
  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    setLoading(true)
    try {
      // Fetch specific job by ID
      const response = await fetch(`/api/jobs/${encodeURIComponent(params.id)}`)
      const data = await response.json()
      
      if (response.ok && data.job) {
        setJob(data.job)
      } else {
        console.error('Job not found:', data.error)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }
const fetchSavedStatus = async () => {
  if (!session) return
  
  try {
    const response = await fetch('/api/jobs/saved')
    const data = await response.json()
    
    if (response.ok) {
      const isSaved = data.savedJobs?.some(
        savedJob => savedJob.job?.externalId === params.id
      )
      setSaved(isSaved)
    }
  } catch (error) {
    console.error('Error checking saved status:', error)
  }
}
useEffect(() => {
  if (job && session) {
    fetchSavedStatus()
  }
}, [job, session])
 // Update the handleAnalyzeMatch function
const handleAnalyzeMatch = async () => {
  if (!session) {
    toast.error('Please log in to analyze job fit')
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
    return
  }

  setAnalyzing(true)
  setMatchScore(null) // Reset previous score
  
  try {
    // Fetch user profile
    const profileResponse = await fetch('/api/user/profile')
    const profileData = await profileResponse.json()
    
    if (!profileResponse.ok) {
      throw new Error(profileData.error || 'Failed to fetch profile')
    }

    // Prepare resume data from user profile
    const resumeData = {
      name: profileData.user.name,
      email: profileData.user.email,
      phone: profileData.user.phone,
      headline: profileData.user.headline,
      bio: profileData.user.bio,
      location: profileData.user.location,
      skills: profileData.user.skills || [],
      experience: profileData.user.experience || [],
      education: profileData.user.education || [],
      certifications: profileData.user.certifications || [],
      portfolio: profileData.user.portfolio || []
    }

    // Prepare job data
    const jobData = {
      title: job.title,
      company: job.company?.name,
      description: job.description,
      requirements: job.requirements || [],
      skills: job.skills || [],
      experienceLevel: job.experienceLevel,
      type: job.type,
      location: job.location
    }

    // Call job match API
    const matchResponse = await fetch('/api/ai/job-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ resumeData, jobData })
    })

    const matchData = await matchResponse.json()

    if (!matchResponse.ok) {
      throw new Error(matchData.error || 'Failed to analyze job match')
    }

    // Set the match score with the API response
    setMatchScore({
      score: matchData.matchAnalysis.matchScore || 0,
      matchingSkills: matchData.matchAnalysis.matchingSkills || [],
      missingSkills: matchData.matchAnalysis.missingSkills || [],
      recommendation: matchData.matchAnalysis.recommendation || 'Analysis complete'
    })
    
    toast.success('Analysis complete!')
  } catch (error) {
    console.error('Error analyzing job match:', error)
    toast.error(error.message || 'Failed to analyze job fit')
  } finally {
    setAnalyzing(false)
  }
}
const handleShare = async () => {
  const jobUrl = `${window.location.origin}/jobs/${params.id}`
  const shareData = {
    title: job.title,
    text: `Check out this job: ${job.title} at ${job.company?.name}`,
    url: jobUrl
  }

  try {
    // Check if Web Share API is available
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(jobUrl)
      toast.success('Job link copied to clipboard!')
    }
  } catch (error) {
    // If sharing fails or is cancelled
    if (error.name !== 'AbortError') {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(jobUrl)
        toast.success('Job link copied to clipboard!')
      } catch (clipboardError) {
        console.error('Failed to copy:', clipboardError)
        toast.error('Failed to share job')
      }
    }
  }
}
const handleSaveJob = async () => {
  if (!session) {
    toast.error('Please log in to save jobs')
    router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
    return
  }

  setSaving(true)
  
  try {
    if (saved) {
      // Unsave job
      const response = await fetch(`/api/jobs/saved?externalId=${encodeURIComponent(job.externalId)}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSaved(false)
        toast.success('Job removed from saved jobs')
      } else {
        toast.error(data.error || 'Failed to remove job')
      }
    } else {
      // Save job
      const response = await fetch('/api/jobs/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSaved(true)
        toast.success('Job saved successfully!')
      } else if (data.alreadySaved) {
        setSaved(true)
        toast.info('Job already saved')
      } else if (data.requiresAuth) {
        toast.error('Please log in to save jobs')
        router.push('/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname))
      } else {
        toast.error(data.error || 'Failed to save job')
      }
    }
  } catch (error) {
    console.error('Error toggling save job:', error)
    toast.error('Failed to save job')
  } finally {
    setSaving(false)
  }
}
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Job not found</h2>
          <p className="text-neutral-500 mb-4">This job may have been removed or expired.</p>
          <Button onClick={() => router.push('/jobs')}>Browse Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {job.company?.logo ? (
                        <img 
                          src={job.company.logo} 
                          alt={job.company?.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building className="h-8 w-8 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                        {job.title}
                      </h1>
                      <p className="text-lg text-neutral-600 mb-4">
                        {job.company?.name}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {job.location?.city || job.location?.country || 'Remote'}
                        </div>
                        {(job.salary?.min || job.salary?.max) && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salary?.min, job.salary?.max, job.salary?.currency)}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          Posted {formatRelativeTime(job.postedAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge>{job.type || 'Full-time'}</Badge>
                        {job.location?.isRemote && <Badge variant="info">Remote</Badge>}
                        {job.experienceLevel && <Badge variant="outline">{job.experienceLevel}</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                    <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="gap-2">
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
  variant="outline" 
  size="lg"
  onClick={handleSaveJob}
  disabled={saving}
  className={saved ? 'bg-primary-50 border-primary-200' : ''}
>
  {saving ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      {saved ? 'Removing...' : 'Saving...'}
    </>
  ) : (
    <>
      {saved ? (
        <BookmarkCheck className="h-4 w-4 mr-2 fill-primary-600 text-primary-600" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {saved ? 'Saved' : 'Save Job'}
    </>
  )}
</Button>
                    <Button 
  variant="outline" 
  size="lg"
  onClick={handleShare}
>
  <Share2 className="h-4 w-4 mr-2" />
  Share
</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Match Score */}
            {matchScore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary-200 bg-primary-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary-600" />
                      AI Match Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-primary-600">
                        <span className="text-2xl font-bold text-primary-600">{matchScore.score}%</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{matchScore.recommendation}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Matching Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchScore.matchingSkills.map((skill) => (
                            <Badge key={skill} variant="success">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-amber-600" />
                          Skills to Develop
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matchScore.missingSkills.map((skill) => (
                            <Badge key={skill} variant="warning">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: job.description || '<p>No description available.</p>' 
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full gap-2">
                      Apply Now
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                  
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleAnalyzeMatch}
                    disabled={analyzing || matchScore}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : matchScore ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        Analysis Complete
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        Analyze My Fit
                      </>
                    )}
                  </Button>
                  
                  <Link href={`/ai/cover-letter?job=${encodeURIComponent(job.externalId)}`}>
                    <Button variant="outline" className="w-full gap-2">
                      <FileText className="h-4 w-4" />
                      Generate Cover Letter
                    </Button>
                  </Link>
                  
                  <Link href={`/ai/interview-prep?job=${encodeURIComponent(job.externalId)}`}>
                    <Button variant="outline" className="w-full gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Get Interview Prep
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    About {job.company?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.company?.website && (
                      <a 
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary-600 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    )}
                    {job.company?.size && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Users className="h-4 w-4" />
                        {job.company.size} employees
                      </div>
                    )}
                    {job.company?.industry && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <Briefcase className="h-4 w-4" />
                        {job.company.industry}
                      </div>
                    )}
                    {job.company?.description && (
                      <p className="text-sm text-neutral-600">
                        {job.company.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Job Source */}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-neutral-500">
                  This job is sourced from <span className="font-medium">{job.source}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


