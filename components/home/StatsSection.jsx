"use client"

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Globe, Briefcase, GraduationCap, Building, Users, CheckCircle } from 'lucide-react'

const stats = [
  { icon: Globe, value: 50, suffix: '+', label: 'Countries', color: 'text-primary-600' },
  { icon: Briefcase, value: 500, suffix: 'K+', label: 'Job Listings', color: 'text-emerald-600' },
  { icon: GraduationCap, value: 50, suffix: 'K+', label: 'Internships', color: 'text-amber-600' },
  { icon: Building, value: 10, suffix: 'K+', label: 'Companies', color: 'text-violet-600' },
  { icon: Users, value: 1, suffix: 'M+', label: 'Job Seekers', color: 'text-rose-600' },
  { icon: CheckCircle, value: 95, suffix: '%', label: 'Success Rate', color: 'text-cyan-600' },
]

function AnimatedCounter({ value, suffix, inView }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    const duration = 2000
    const steps = 60
    const stepValue = value / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, inView])

  return (
    <span>
      {count}{suffix}
    </span>
  )
}

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-16 bg-white border-y" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-neutral-100 mb-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />
              </div>
              <div className="text-sm text-neutral-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}



