"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  Target,
  Lightbulb,
  Download,
  RotateCcw,
  Sparkles,
  Award,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export default function CVAnalyzerPage() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    setFile(selectedFile)
    setError('')

    // For demo, read as text if it's a text file
    if (selectedFile.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => setText(e.target.result)
      reader.readAsText(selectedFile)
    } else {
      // For PDF/DOC, you'd need server-side parsing
      setText(`Resume content from: ${selectedFile.name}\n\nNote: For full PDF parsing, please paste your resume text below or use our server-side parsing.`)
    }
  }

  const handleAnalyze = async () => {
    if (!text || text.length < 50) {
      setError('Please provide your resume content (at least 50 characters)')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data.analysis)
    } catch (err) {
      setError(err.message || 'Failed to analyze CV. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setText('')
    setAnalysis(null)
    setError('')
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-100'
    if (score >= 60) return 'bg-amber-100'
    return 'bg-rose-100'
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Analysis
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            CV/Resume Analyzer
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Get your resume analyzed by AI. Receive an ATS score, improvement suggestions, 
            and learn what keywords you are missing.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Upload Area */}
              <Card className="mb-6">
                <CardContent className="p-8">
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {file ? file.name : 'Upload Your Resume'}
                    </h3>
                    <p className="text-neutral-500 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <label htmlFor="resume-upload">
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          Select File
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-neutral-400 mt-4">
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Or Paste Text */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Or Paste Your Resume Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Paste your resume content here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </CardContent>
              </Card>

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {/* Analyze Button */}
              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={handleAnalyze} 
                  disabled={loading || !text}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze My Resume
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* ATS Score Card */}
              <Card className="mb-6">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className={`w-32 h-32 rounded-full ${getScoreBg(analysis.atsScore)} flex items-center justify-center`}>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                          {analysis.atsScore}
                        </div>
                        <div className="text-sm text-neutral-500">ATS Score</div>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-2">Resume Analysis Complete</h2>
                      <p className="text-neutral-600 mb-4">{analysis.overallAssessment}</p>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {analysis.atsScore >= 80 && (
                          <Badge variant="success" className="gap-1">
                            <Award className="h-3 w-3" />
                            ATS Optimized
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {analysis.experience?.length || 0} Experiences Found
                        </Badge>
                        <Badge variant="secondary">
                          {analysis.skills?.technical?.length || 0} Skills Identified
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        New Analysis
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="improvements">Improvements</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Extracted Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Extracted Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analysis.extractedInfo && (
                          <>
                            <div>
                              <span className="text-sm text-neutral-500">Name:</span>
                              <p className="font-medium">{analysis.extractedInfo.name || 'Not detected'}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral-500">Email:</span>
                              <p className="font-medium">{analysis.extractedInfo.email || 'Not detected'}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral-500">Phone:</span>
                              <p className="font-medium">{analysis.extractedInfo.phone || 'Not detected'}</p>
                            </div>
                            <div>
                              <span className="text-sm text-neutral-500">Location:</span>
                              <p className="font-medium">{analysis.extractedInfo.location || 'Not detected'}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Skills Identified
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {analysis.skills?.technical?.length > 0 && (
                          <div>
                            <span className="text-sm text-neutral-500 block mb-2">Technical Skills:</span>
                            <div className="flex flex-wrap gap-2">
                              {analysis.skills.technical.map((skill, i) => (
                                <Badge key={i} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.skills?.soft?.length > 0 && (
                          <div>
                            <span className="text-sm text-neutral-500 block mb-2">Soft Skills:</span>
                            <div className="flex flex-wrap gap-2">
                              {analysis.skills.soft.map((skill, i) => (
                                <Badge key={i} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Experience */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Experience Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analysis.experience?.length > 0 ? (
                          <div className="space-y-4">
                            {analysis.experience.map((exp, i) => (
                              <div key={i} className="border-l-2 border-primary-200 pl-4">
                                <h4 className="font-semibold">{exp.title}</h4>
                                <p className="text-neutral-600">{exp.company}</p>
                                <p className="text-sm text-neutral-500">{exp.duration}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-neutral-500">No experience entries detected</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="strengths">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle className="h-5 w-5" />
                        Your Resume Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.strengths?.map((strength, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </div>
                        )) || <p className="text-neutral-500">No strengths identified</p>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="improvements">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <Lightbulb className="h-5 w-5" />
                        Improvement Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.suggestions?.map((suggestion, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                            <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </div>
                        )) || <p className="text-neutral-500">No suggestions at this time</p>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="keywords">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-rose-700">
                        <XCircle className="h-5 w-5" />
                        Missing Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600 mb-4">
                        These keywords are commonly found in job descriptions but missing from your resume:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywordsMissing?.map((keyword, i) => (
                          <Badge key={i} variant="destructive" className="bg-rose-100 text-rose-700 border-0">
                            {keyword}
                          </Badge>
                        )) || <p className="text-neutral-500">No missing keywords identified</p>}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


