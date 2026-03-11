'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

const AdminSearch = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query) {
      router.push('/admin')
      return
    }

    const fetchResults = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('Search failed')
        }
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, router])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Search Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Found {results?.total || 0} results for "{query}"
            </p>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </Card>
        )}

        {!error && results && (
          <>
            {/* Jobs Results */}
            {results.jobs.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Jobs ({results.jobs.length})
                </h3>
                <div className="space-y-3">
                  {results.jobs.map((job, index) => (
                    <Link key={index} href={`/jobs/${job._id || job.externalId}`}>
                      <Card
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {job.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {job.company?.name} • {job.location?.city}, {job.location?.country}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {job.views} views
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Results */}
            {results.posts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Posts ({results.posts.length})
                </h3>
                <div className="space-y-3">
                  {results.posts.map((post, index) => (
                    <Link key={index} href={`/admin/posts?highlight=${post._id}`}>
                      <Card
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {post.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {post.category} • {post.status}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.views} views
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Users Results */}
            {results.users.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Users ({results.users.length})
                </h3>
                <div className="space-y-3">
                  {results.users.map((user, index) => (
                    <Link key={index} href={`/admin/users?highlight=${user._id}`}>
                      <Card
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {user.email} • {user.isAdmin ? 'Admin' : 'User'}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {user.role}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.total === 0 && (
              <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No results found for "{query}"
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminSearch
