'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  User,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function BlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const slug = params?.slug
  const [viewTracked, setViewTracked] = useState(false)

  useEffect(() => {
    if (!slug) return

    let isMounted = true

    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/${slug}`)
        if (response.ok && isMounted) {
          const data = await response.json()
          setPost(data.post)

          // Track view ONLY if not already tracked
          if (!viewTracked && isMounted) {
            setViewTracked(true)

            // Small delay to ensure state is set
            setTimeout(() => {
              fetch('/api/blog/impressions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  postId: data.post._id,
                  impressionType: 'view'
                })
              }).catch(err => console.error('Error tracking view:', err))
            }, 100)
          }
        } else if (isMounted) {
          setPost(null)
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        if (isMounted) setPost(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPost()

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false
    }
  }, [slug, viewTracked])

  const handleLike = async () => {
    if (!post) return
    const newLiked = !liked
    setLiked(newLiked)

    // Track like impression
    try {
      await fetch('/api/blog/impressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          impressionType: 'like'
        })
      })

      // Update post like count
      await fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: newLiked })
      })
    } catch (err) {
      console.error('Error tracking like:', err)
    }
  }

  const handleShare = async () => {
    if (!post) return

    // Track share impression
    try {
      await fetch('/api/blog/impressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          impressionType: 'share'
        })
      })

      // Use native share if available
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error tracking share:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Post not found</h1>
          <Link href="/blog">
            <Button className="bg-primary-600 hover:bg-primary-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      <article className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Featured Image */}
            {post.featuredImage?.url && (
              <div className="mb-8 rounded-xl overflow-hidden">
                <img
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt || post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full capitalize">
                {post.category?.replace('-', ' ')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-5 h-5" />
                <span>{post.author?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="w-5 h-5" />
                <span>{post.views} views</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose dark:prose-invert max-w-none mb-10">
              <div
                className="text-lg leading-relaxed text-foreground whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-10 pb-10 border-b border-border">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link key={tag} href={`/blog?search=${tag}`}>
                      <span className="inline-block px-3 py-1 bg-secondary text-foreground text-sm rounded-full hover:bg-secondary/80 transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 py-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Liked' : 'Like'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Author Card */}
            <Card className="mt-12 border-0 bg-secondary dark:bg-slate-900">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  About {post.author?.name || 'the Author'}
                </h3>
                <p className="text-muted-foreground">
                  This article was written by our editorial team to provide valuable insights and information.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </article>

      {/* Related Posts Section */}
      <section className="py-12 md:py-20 bg-secondary dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              More Articles
            </h2>
            <p className="text-muted-foreground">
              Check out more insights from our blog
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Link href="/blog">
              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                View All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
