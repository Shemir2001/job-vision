'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'
import PostFormDialog from '@/components/admin/PostFormDialog'

const AdminPosts = () => {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const highlightRef = useRef(null)

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  // Add blinking animation styles
  useEffect(() => {
    if (!highlightId) return

    const styleId = 'highlight-animation-posts'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        @keyframes blueBlink {
          0%, 100% {
            background-color: #3b82f6 !important;
            box-shadow: inset 0 0 0 2px #1e40af !important;
          }
          50% {
            background-color: #2563eb !important;
            box-shadow: inset 0 0 0 2px #1e40af, 0 0 15px rgba(59, 130, 246, 0.6) !important;
          }
        }
        tr.post-highlight-row {
          animation: blueBlink 0.8s infinite !important;
          background-color: #3b82f6 !important;
        }
        tr.post-highlight-row td {
          color: white !important;
          font-weight: 600 !important;
          background-color: transparent !important;
        }
        tr.post-highlight-row td span {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.15) !important;
        }
      `
      document.head.appendChild(style)
    }

    // Scroll into view
    if (highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }

    // Auto remove after 10 seconds
    const timeoutId = setTimeout(() => {
      const url = new URL(window.location)
      url.searchParams.delete('highlight')
      window.history.replaceState({}, '', url.toString())
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [highlightId])

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== 'all' && { status })
      })

      const response = await fetch(`/api/admin/posts?${params}`)
      if (!response.ok) throw new Error('Failed to fetch posts')

      const data = await response.json()
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
  }, [search, status])

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightId, posts])

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete post')
      setPosts(posts.filter(p => p._id !== postId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handlePostSaved = () => {
    setShowForm(false)
    setEditingPost(null)
    fetchPosts(pagination.page)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Posts</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage blog posts and content</p>
          </div>
          <Button
            onClick={() => {
              setEditingPost(null)
              setShowForm(true)
            }}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        <PostFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          post={editingPost}
          onSaved={handlePostSaved}
        />

        {/* Filters */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Posts Table */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No posts found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {posts.map((post) => (
                      <tr
                        key={post._id}
                        ref={post._id === highlightId ? highlightRef : null}
                        className={post._id === highlightId ? 'post-highlight-row' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {post.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {post.author?.name || 'Unknown'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.views || 0}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                : post.status === 'draft'
                                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPost(post)
                                setShowForm(true)
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post._id)}
                              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {posts.length} of {pagination.total} posts
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => fetchPosts(pagination.page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchPosts(pagination.page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminPosts
