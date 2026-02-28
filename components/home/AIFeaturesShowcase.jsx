"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { FileText, Brain, MessageSquare, Target, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const aiFeatures = [
  {
    icon: FileText,
    title: 'CV/Resume Analyzer',
    description: 'Get your resume analyzed by AI. Receive ATS score, improvement suggestions, and keyword recommendations.',
    href: '/ai/cv-analyzer',
    color: 'bg-primary-600',
  },
  {
    icon: Target,
    title: 'Job Matching Engine',
    description: 'AI-powered algorithm that matches your skills and experience with perfect job opportunities.',
    href: '/dashboard',
    color: 'bg-emerald-600',
  },
  {
    icon: MessageSquare,
    title: 'Cover Letter Generator',
    description: 'Create personalized, compelling cover letters tailored to specific job descriptions.',
    href: '/ai/cover-letter',
    color: 'bg-violet-600',
  },
  {
    icon: Brain,
    title: 'Interview Preparation',
    description: 'Practice with AI-generated interview questions based on job descriptions and get feedback.',
    href: '/ai/interview-prep',
    color: 'bg-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills for your desired jobs and get learning recommendations.',
    href: '/ai/career-coach',
    color: 'bg-rose-600',
  },
  {
    icon: Lightbulb,
    title: 'Career Coach',
    description: 'Get AI-driven career guidance, salary insights, and personalized path suggestions.',
    href: '/ai/career-coach',
    color: 'bg-cyan-600',
  },
]

export default function AIFeaturesShowcase() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            AI-Powered Features
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Supercharge Your Job Search with AI
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Leverage cutting-edge AI technology to find the perfect job, optimize your resume, and ace your interviews.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="group h-full bg-neutral-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary-200">
                  <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all">
                    Try Now
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link href="/ai/cv-analyzer">
            <Button size="lg" className="gap-2">
              <Brain className="h-5 w-5" />
              Start with Free CV Analysis
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}



