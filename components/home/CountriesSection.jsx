"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { countries } from '@/lib/job-apis'

export default function CountriesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 bg-neutral-50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Jobs From Around The World
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Explore opportunities in 50+ countries. Your next career adventure awaits!
          </p>
        </motion.div>

        {/* Countries Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {countries.map((country, index) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
             <Link href={`/jobs?country=${country.code}`}>
  <div className="group bg-[#334155] rounded-xl p-4 text-center hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border border-transparent hover:border-primary-200">
    {/* Flag Image */}
    <div className="w-16 h-12 mx-auto mb-3 rounded-md overflow-hidden group-hover:scale-110 transition-transform duration-200">
      <img 
        src={country.flagUrl} 
        alt={`${country.name} flag`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <p className="text-sm font-medium text-white group-hover:text-primary-600 transition-colors">
      {country.name}
    </p>
  </div>
</Link>
            </motion.div>
          ))}
        </div>

        {/* Remote Work Banner */}
        <motion.div
          className="mt-12 bg-primary-600 rounded-2xl p-8 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-2">
            🌐 Work From Anywhere
          </h3>
          <p className="text-primary-100 mb-4">
            Explore thousands of remote opportunities and work from any location in the world.
          </p>
          <Link href="/jobs?remote=true">
            <button className="px-6 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              Browse Remote Jobs
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}


