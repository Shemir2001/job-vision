"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Loader2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Target,
  Briefcase,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from '@/components/ui/accordion'

// Create simple Accordion components if not in shadcn
const SimpleAccordion = ({ children }) => <div className="space-y-2">{children}</div>
const SimpleAccordionItem = ({ question, tip, sampleAnswer, isOpen, onToggle }) => (
  <div className="border rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 text-left flex items-start justify-between hover:bg-neutral-50"
    >
      <div className="flex-1 pr-4">
        <p className="font-medium">{question}</p>
      </div>
      {isOpen ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="p-4 pt-0 space-y-3">
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Tip
              </p>
              <p className="text-sm text-amber-700 mt-1">{tip}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Sample Answer
              </p>
              <p className="text-sm text-emerald-700 mt-1">{sampleAnswer}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)

function InterviewPrepContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get('job')

  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [prep, setPrep] = useState(null)
  const [openQuestions, setOpenQuestions] = useState({})

  const handleGenerate = async () => {
    if (!jobTitle && !jobDescription) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobData: {
            title: jobTitle,
            company: { name: companyName },
            description: jobDescription
          },
          industry
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setPrep(data.interviewPrep)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Preparation
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Interview Preparation
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Get AI-generated interview questions and expert tips based on your target role and company.
          </p>
        </motion.div>

        {!prep ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Enter Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title *</Label>
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
                  <Label>Industry</Label>
                  <input
                    type="text"
                    className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Job Description (Optional)</Label>
                  <textarea
                    className="w-full h-32 mt-2 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Paste the job description for more tailored questions..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleGenerate}
                  disabled={loading || !jobTitle}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Interview Prep
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Tips */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Target className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-900">Dress Code</p>
                      <p className="text-sm text-emerald-700">{prep.dresscode || 'Business Professional'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">Research Points</p>
                      <p className="text-sm text-amber-700">{prep.researchPoints?.length || 0} topics to study</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-violet-50 border-violet-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium text-violet-900">Questions to Ask</p>
                      <p className="text-sm text-violet-700">{prep.questionsToAsk?.length || 0} smart questions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Questions Tabs */}
            <Tabs defaultValue="common" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="common">Common Questions</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              </TabsList>

              <TabsContent value="common">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Interview Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleAccordion>
                      {prep.commonQuestions?.map((q, i) => (
                        <SimpleAccordionItem
                          key={i}
                          question={q.question}
                          tip={q.tip}
                          sampleAnswer={q.sampleAnswer}
                          isOpen={openQuestions[`common-${i}`]}
                          onToggle={() => toggleQuestion('common', i)}
                        />
                      ))}
                    </SimpleAccordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleAccordion>
                      {prep.technicalQuestions?.map((q, i) => (
                        <SimpleAccordionItem
                          key={i}
                          question={q.question}
                          tip={q.tip}
                          sampleAnswer={q.sampleAnswer}
                          isOpen={openQuestions[`technical-${i}`]}
                          onToggle={() => toggleQuestion('technical', i)}
                        />
                      ))}
                    </SimpleAccordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavioral">
                <Card>
                  <CardHeader>
                    <CardTitle>Behavioral Questions (STAR Method)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleAccordion>
                      {prep.behavioralQuestions?.map((q, i) => (
                        <SimpleAccordionItem
                          key={i}
                          question={q.question}
                          tip={q.tip}
                          sampleAnswer={q.sampleAnswer}
                          isOpen={openQuestions[`behavioral-${i}`]}
                          onToggle={() => toggleQuestion('behavioral', i)}
                        />
                      ))}
                    </SimpleAccordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Additional Tips */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    Preparation Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prep.preparationTips?.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-1" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-rose-700">
                    <AlertTriangle className="h-5 w-5" />
                    Common Mistakes to Avoid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prep.commonMistakes?.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-1" />
                        <span className="text-sm">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Questions to Ask */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary-600" />
                  Smart Questions to Ask the Interviewer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {prep.questionsToAsk?.map((question, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-primary-50 rounded-lg">
                      <span className="text-primary-600 font-medium">{i + 1}.</span>
                      <span className="text-sm">{question}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reset Button */}
            <div className="text-center">
              <Button variant="outline" onClick={() => setPrep(null)}>
                Prepare for Another Role
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <InterviewPrepContent />
    </Suspense>
  )
}



