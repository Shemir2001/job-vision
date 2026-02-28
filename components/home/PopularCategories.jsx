"use client"

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { 
  Code2, 
  Stethoscope, 
  TrendingUp, 
  Megaphone, 
  PenTool, 
  Scale, 
  GraduationCap, 
  Wrench,
  Headphones,
  Users,
  Briefcase,
  ArrowRight,
  ShoppingCart
} from 'lucide-react'

const categories = [
  { icon: Code2, label: 'Technology', href: '/jobs?category=it-jobs', color: 'bg-blue-50' },
  { icon: Wrench, label: 'Engineering', href: '/jobs?category=engineering-jobs', color: 'bg-orange-50' },
  { icon: Stethoscope, label: 'Healthcare', href: '/jobs?category=healthcare-nursing-jobs', color: 'bg-rose-50' },
  { icon: TrendingUp, label: 'Finance', href: '/jobs?category=accounting-finance-jobs', color: 'bg-emerald-50' },
  { icon: Megaphone, label: 'Marketing', href: '/jobs?category=marketing-jobs', color: 'bg-violet-50' },
  { icon: PenTool, label: 'Design', href: '/jobs?category=creative-design-jobs', color: 'bg-pink-50' },
  { icon: Scale, label: 'Legal', href: '/jobs?category=legal-jobs', color: 'bg-amber-50' },
  { icon: GraduationCap, label: 'Education', href: '/jobs?category=teaching-jobs', color: 'bg-cyan-50' },
  { icon: Headphones, label: 'Customer Service', href: '/jobs?category=customer-services-jobs', color: 'bg-teal-50' },
  { icon: Users, label: 'Human Resources', href: '/jobs?category=hr-jobs', color: 'bg-indigo-50' },
  { icon: Briefcase, label: 'Administration', href: '/jobs?category=admin-jobs', color: 'bg-slate-50' },
  { icon: ShoppingCart, label: 'Sales', href: '/jobs?category=sales-jobs', color: 'bg-green-50' },
]

export default function PopularCategories() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

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
            Popular Categories
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Explore opportunities across various industries and find your perfect career path
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link href={category.href}>
                <div className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer border border-transparent hover:border-primary-200">
                  <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="h-6 w-6 text-[#33415] stroke-[1.5]" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">
                    {category.label}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {category.count} jobs
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="/jobs">
            <button className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors">
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}