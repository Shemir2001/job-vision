'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const PostFormDialog = ({ open, onOpenChange, post, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'career-tips',
    tags: '',
    featuredImage: { url: '', alt: '' },
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        tags: post.tags?.join(', ') || '',
        seoKeywords: post.seoKeywords?.join(', ') || ''
      })
    } else {
      resetForm()
    }
  }, [post, open])

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'career-tips',
      tags: '',
      featuredImage: { url: '', alt: '' },
      status: 'draft',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        seoKeywords: formData.seoKeywords.split(',').map(k => k.trim()).filter(k => k)
      }

      const url = post ? `/api/admin/posts/${post._id}` : '/api/admin/posts'
      const method = post ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save post')
      }

      onOpenChange(false)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-start justify-center pt-8 pb-8">
      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-4xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title*
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Brief excerpt..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content*
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows="10"
                  placeholder="Full post content..."
                />
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category*
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="career-tips">Career Tips</option>
                <option value="industry-news">Industry News</option>
                <option value="interview-prep">Interview Prep</option>
                <option value="resume-guide">Resume Guide</option>
                <option value="success-stories">Success Stories</option>
                <option value="company-spotlight">Company Spotlight</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Featured Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.featuredImage.url}
                  onChange={(e) => setFormData({ ...formData, featuredImage: { ...formData.featuredImage, url: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={formData.featuredImage.alt}
                  onChange={(e) => setFormData({ ...formData, featuredImage: { ...formData.featuredImage, alt: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Image description"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Meta description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Publishing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status*
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-violet-600 dark:bg-violet-700 hover:bg-violet-700 dark:hover:bg-violet-800 text-white dark:text-white"
          >
            {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default PostFormDialog
