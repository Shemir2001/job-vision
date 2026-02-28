"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase, Sparkles, Upload, Zap, Users, Briefcase as BriefcaseIcon, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { countries, jobCategories } from '@/lib/job-apis'
import Link from 'next/link'

const quickFilters = [
  { label: 'Remote', value: 'remote' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Internships', value: 'internship' },
  { label: 'Entry-level', value: 'entry' },
]

export default function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (location) params.set('country', location)
    if (category) params.set('category', category)
    router.push(`/jobs?${params.toString()}`)
  }

  const handleQuickFilter = (filter) => {
    if (filter === 'internship') {
      router.push('/internships')
    } else if (filter === 'remote') {
      router.push('/jobs?remote=true')
    } else {
      router.push(`/jobs?type=${filter}`)
    }
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Mobile Background Image - Only visible on mobile */}
      <div className="absolute inset-0 lg:hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-neutral-900 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=870&auto=format&fit=crop"
          alt="Professional background"
          className="w-full h-full object-cover opacity-20 dark:opacity-10"
        />
      </div>

      {/* Desktop Background Gradient */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800"></div>

      {/* Main Hero Content — changed lg:items-start → lg:items-center */}
      <div className="relative z-20 w-full py-12 sm:py-16 md:py-2 lg:py-1 lg:min-h-screen lg:flex lg:items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {/* Two Column Grid — changed items-start → items-center */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center lg:min-h-screen lg:py-0">
            
            {/* Left Content Section - Always visible, optimized for mobile */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center w-full z-20"
            >
              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-blue-600 dark:text-white mb-4 sm:mb-6 leading-tight sm:leading-tight"
                style={{ 
                  fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  fontWeight: 700
                }}
              >
                Find Your Dream Job
                <br />
                <span className="text-slate-700 dark:text-primary-400">Across The Globe</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 leading-relaxed max-w-md lg:max-w-lg"
                style={{ 
                  fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  fontWeight: 400
                }}
              >
                Access 500,000+ jobs and internships from 50+ countries with AI-powered recommendations tailored just for you.
              </motion.p>

              {/* Search Box - Responsive Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-3 sm:p-4 mb-6 w-full backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
              >
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {/* Location Select */}
                  <div className="relative w-full">
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Location</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="h-10 sm:h-11 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-primary-500 rounded-md text-sm">
                        <MapPin className="h-4 w-4 mr-1.5 sm:mr-2 text-primary-500 flex-shrink-0" />
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Title Input */}
                  <div className="relative w-full">
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Job Title</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 flex-shrink-0" />
                      <Input
                        placeholder="Job title or keywords"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 sm:pl-10 h-10 sm:h-11 border border-slate-200 dark:border-neutral-700 dark:bg-neutral-900 focus:ring-1 focus:ring-primary-500 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Select */}
                  <div className="relative w-full">
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-10 sm:h-11 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-primary-500 rounded-md text-sm">
                        <Briefcase className="h-4 w-4 mr-1.5 sm:mr-2 text-primary-500 flex-shrink-0" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Button */}
                  <div className="flex items-end w-full">
                    <Button 
                      type="submit" 
                      className="w-full h-10 sm:h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all text-sm"
                    >
                      Search
                    </Button>
                  </div>
                </form>
              </motion.div>

              {/* Quick Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mb-3">Popular Searches:</p>
                <div className="flex flex-wrap gap-2">
                  {quickFilters.map((filter, index) => (
                    <motion.button
                      key={filter.value}
                      onClick={() => handleQuickFilter(filter.value)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700 rounded-full transition-all hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400 shadow-sm whitespace-nowrap backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {filter.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image Section - Visible only on Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex relative w-full lg:min-h-screen items-center justify-center"
            >
              {/* Responsive container */}
              <div className="relative w-full h-full flex items-center justify-center py-16">
                
                {/* Background decorative elements */}
                <div className="absolute inset-0">
                  {/* Yellow bar - top left */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="absolute top-12 sm:top-16 md:top-24 left-0 w-20 md:w-28 h-16 md:h-20 bg-primary-500 rounded-r-lg z-10"
                  ></motion.div>

                  {/* Dark bar - top right */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="absolute top-4 md:top-8 right-0 w-32 md:w-40 h-40 md:h-48 bg-slate-700 dark:bg-slate-600 rounded-bl-lg"
                  >
                    {/* Dot pattern */}
                    <div className="absolute bottom-5 md:bottom-6 right-5 md:right-6 grid grid-cols-4 gap-2">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white/40"></div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Yellow bar - bottom */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="absolute bottom-20 md:bottom-32 left-4 md:left-8 w-32 md:w-36 h-24 md:h-28 bg-primary-500 rounded-tr-lg z-10"
                  ></motion.div>

                  {/* Gray bar - middle left */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 w-18 md:w-20 h-14 md:h-16 bg-slate-400 dark:bg-slate-500 rounded-r-lg z-10"
                  ></motion.div>
                </div>

                {/* Main Image Container */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative z-20 w-full px-6 md:px-8 lg:px-12 max-w-lg"
                >
                  <div className="relative w-full">
                    {/* Main Image */}
                    <img
                      src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=870&auto=format&fit=crop"
                      alt="Professional with laptop"
                      className="w-full h-auto object-contain relative z-20 rounded-lg"
                    />
                    
                    {/* Stat Badge - Top (Career Transitions) */}
                    <motion.div
                      initial={{ opacity: 0, y: -30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 z-30"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 md:w-20 h-16 md:h-20 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-500 mb-2 hover:scale-110 transition-transform cursor-pointer">
                          <Users className="w-8 md:w-10 h-8 md:h-10 text-blue-500" strokeWidth={1.5} />
                        </div>
                        <div className="bg-white dark:bg-neutral-800 rounded-lg md:rounded-xl shadow-lg px-3 md:px-4 py-2 text-center">
                          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">1K+</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">Career Transitions</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stat Badge - Left (Job Opportunities) */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.1 }}
                      className="absolute top-1/4 -translate-y-1/2 -left-16 md:-left-20 z-30"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 md:w-20 h-16 md:h-20 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-500 mb-2 hover:scale-110 transition-transform cursor-pointer">
                          <BriefcaseIcon className="w-8 md:w-10 h-8 md:h-10 text-emerald-500" strokeWidth={1.5} />
                        </div>
                        <div className="bg-white dark:bg-neutral-800 rounded-lg md:rounded-xl shadow-lg px-3 md:px-4 py-2 text-center">
                          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">1K+</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">Job Opportunities</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Stat Badge - Right (Partner Companies) */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                      className="absolute top-1/4 -translate-y-1/2 -right-16 md:-right-20 z-30"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-16 md:w-20 h-16 md:h-20 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-purple-500 mb-2 hover:scale-110 transition-transform cursor-pointer">
                          <Building2 className="w-8 md:w-10 h-8 md:h-10 text-purple-500" strokeWidth={1.5} />
                        </div>
                        <div className="bg-white dark:bg-neutral-800 rounded-lg md:rounded-xl shadow-lg px-3 md:px-4 py-2 text-center">
                          <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">500+</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">Partner Companies</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Follow Us card - center bottom of image */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.3 }}
                      className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 rounded-lg md:rounded-xl shadow-lg p-3 z-30"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium text-center">Follow Us</p>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                          </svg>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Buttons Section */}
      <motion.div
        className="relative z-20 bg-white dark:bg-neutral-900 py-6 sm:py-8 border-t dark:border-neutral-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.2 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            <Link href="/ai/cv-analyzer" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full gap-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-semibold bg-white dark:bg-neutral-800 border-2 border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-700 hover:border-primary-400 rounded-md shadow-sm hover:shadow-md transition-all"
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>Upload CV for Free Analysis</span>
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full gap-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 rounded-md shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>Get AI Job Recommendations</span>
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  )
}