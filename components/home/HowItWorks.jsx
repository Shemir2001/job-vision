"use client"

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { UserPlus, Upload, Sparkles, Send } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up in seconds and build your professional profile with your experience and skills.',
    color: 'bg-primary-600',
  },
  {
    icon: Upload,
    title: 'Upload Your CV',
    description: 'Our AI analyzes your resume to understand your strengths and match you with perfect opportunities.',
    color: 'bg-emerald-600',
  },
  {
    icon: Sparkles,
    title: 'Get AI Recommendations',
    description: 'Receive personalized job matches based on your skills, experience, and career goals.',
    color: 'bg-violet-600',
  },
  {
    icon: Send,
    title: 'Apply & Land Your Job',
    description: 'Apply with one click using AI-generated cover letters and track your applications.',
    color: 'bg-amber-600',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-neutral-50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Finding your dream job has never been easier. Follow these simple steps to get started.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-neutral-200" />
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-sm font-bold text-neutral-600">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`${step.color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4`}>
                  <step.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}



