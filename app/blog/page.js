'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  User,
  Eye,
  Heart,
  Share2,
  Search,
  Filter,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

const categories = [
  { value: 'all', label: 'All Posts' },
  { value: 'career-tips', label: 'Career Tips' },
  { value: 'industry-news', label: 'Industry News' },
  { value: 'interview-prep', label: 'Interview Prep' },
  { value: 'resume-guide', label: 'Resume Guide' },
  { value: 'success-stories', label: 'Success Stories' },
  { value: 'company-spotlight', label: 'Company Spotlight' },
]

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredPosts, setFilteredPosts] = useState([])

  // Fetch published posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/blog?limit=100')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = posts

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPosts(filtered)
  }, [posts, searchQuery, selectedCategory])

  // Featured post (most viewed published post)
  const featuredPost = posts.length > 0 ? posts[0] : null

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Header Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute -bottom-8 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Job Portal Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Get insights on career growth, industry trends, and job search strategies
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-base"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Featured Image */}
                    {featuredPost.featuredImage?.url && (
                      <div className="relative h-80 md:h-96 overflow-hidden">
                        <img
                          src={featuredPost.featuredImage.url}
                          alt={featuredPost.featuredImage.alt || featuredPost.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-4 py-1 bg-primary-600 text-white text-sm font-medium rounded-full capitalize">
                            {featuredPost.category?.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="mb-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 line-clamp-2">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground text-lg line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pt-4 border-t border-border">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {featuredPost.author?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {featuredPost.views} views
                        </span>
                      </div>

                      <Button className="w-fit bg-primary-600 hover:bg-primary-700">
                        Read Article <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-0 bg-white dark:bg-slate-900 overflow-hidden group">
                        {/* Image */}
                        {post.featuredImage?.url && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={post.featuredImage.url}
                              alt={post.featuredImage.alt || post.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full capitalize">
                                {post.category?.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <CardContent className="flex-1 p-5 flex flex-col">
                          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {post.title}
                          </h3>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {post.excerpt}
                          </p>

                          {/* Meta Info */}
                          <div className="space-y-3 pt-4 border-t border-border">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {post.views}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {post.author?.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                                  <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                                </button>
                                <button className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
                                  <Share2 className="w-4 h-4 text-muted-foreground" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="mb-4">
                <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 md:py-20 bg-primary-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Subscribe to our newsletter to get the latest career tips and job opportunities
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="bg-primary-600 hover:bg-primary-700">
                Subscribe
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
