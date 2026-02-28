"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Loader2, 
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  CheckCircle,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'

function CoverLetterContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('job')

  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState(null)
  const [copied, setCopied] = useState(false)

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Shows genuine excitement' },
    { value: 'creative', label: 'Creative', description: 'Unique and memorable' },
  ]

  const handleGenerate = async () => {
    if (!resumeText || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please provide both your resume and job description.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: { text: resumeText },
          jobData: {
            title: jobTitle,
            company: { name: companyName },
            description: jobDescription
          },
          tone
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setCoverLetter(data.coverLetter)
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || 'Failed to generate cover letter',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (coverLetter?.fullText) {
      navigator.clipboard.writeText(coverLetter.fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Cover letter copied to clipboard",
      })
    }
  }

  const handleDownload = () => {
    if (coverLetter?.fullText) {
      const blob = new Blob([coverLetter.fullText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cover-letter-${companyName || 'job'}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full text-violet-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Generation
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Cover Letter Generator
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Create personalized, compelling cover letters tailored to specific job descriptions using AI.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Resume/Background</Label>
                  <textarea
                    className="w-full h-40 mt-2 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Paste your resume or describe your background, experience, and skills..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <input
                      type="text"
                      className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Company Name</Label>
                    <input
                      type="text"
                      className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Job Description</Label>
                  <textarea
                    className="w-full h-40 mt-2 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choose Your Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        tone === t.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs text-neutral-500">{t.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Cover Letter</CardTitle>
                  {coverLetter && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? (
                          <CheckCircle className="h-4 w-4 mr-1 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleGenerate}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {coverLetter ? (
                  <div className="space-y-4">
                    {coverLetter.subject && (
                      <div className="p-3 bg-neutral-100 rounded-lg">
                        <span className="text-sm font-medium text-neutral-500">Subject: </span>
                        <span>{coverLetter.subject}</span>
                      </div>
                    )}
                    <div className="prose prose-neutral max-w-none">
                      <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
                        {coverLetter.fullText || (
                          <>
                            {coverLetter.greeting}
                            {'\n\n'}
                            {coverLetter.opening}
                            {'\n\n'}
                            {coverLetter.body}
                            {'\n\n'}
                            {coverLetter.closing}
                            {'\n\n'}
                            {coverLetter.signature}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center text-neutral-400">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Your generated cover letter will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <CoverLetterContent />
    </Suspense>
  )
}

