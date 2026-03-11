'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight, Power } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'
import JobFormDialog from '@/components/admin/JobFormDialog'
import Link from 'next/link'

const AdminJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [jobStats, setJobStats] = useState({}) // Store stats for jobs

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
        source: 'manual', // Only fetch manually added jobs
        ...(search && { search }),
        ...(status !== 'all' && { status })
      })

      const response = await fetch(`/api/admin/jobs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch jobs')

      const data = await response.json()
      setJobs(data.jobs)
      setPagination(data.pagination)

      // Fetch stats for each job
      data.jobs.forEach(job => {
        fetchJobStats(job._id)
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobStats = async (jobId) => {
    try {
      const response = await fetch(`/api/admin/jobs/stats?jobId=${jobId}`)
      if (response.ok) {
        const stats = await response.json()
        setJobStats(prev => ({
          ...prev,
          [jobId]: stats
        }))
      }
    } catch (err) {
      console.error('Error fetching job stats:', err)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, [search, status])

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete job')

      setJobs(jobs.filter(j => j._id !== jobId))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleToggleJobStatus =async (jobId) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/toggle-status`, {
        method: 'PATCH'
      })

      if (!response.ok) throw new Error('Failed to toggle job status')

      const data = await response.json()
      setJobs(jobs.map(j => j._id === jobId ? data.job : j))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleJobSaved = () => {
    setShowForm(false)
    setEditingJob(null)
    fetchJobs(pagination.page)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Jobs</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create, edit, and manage job postings</p>
          </div>
          <Button
            onClick={() => {
              setEditingJob(null)
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Job Form Dialog */}
        <JobFormDialog
          open={showForm}
          onOpenChange={setShowForm}
          job={editingJob}
          onSaved={handleJobSaved}
        />

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by title or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Jobs Table */}
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
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No jobs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Impressions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {jobs.map((job) => (
                      <tr
                        key={job._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {job.location?.city}, {job.location?.country}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {job.company?.name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {jobStats[job._id]?.impressions?.total || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {jobStats[job._id]?.impressions?.clicks || 0} clicks
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {jobStats[job._id]?.applications?.total || 0}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              job.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/jobs/${job._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingJob(job)
                                setShowForm(true)
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleJobStatus(job._id)}
                              className={`${
                                job.isActive
                                  ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                              }`}
                              title={job.isActive ? 'Deactivate job' : 'Activate job'}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJob(job._id)}
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

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {jobs.length} of {pagination.total} jobs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => fetchJobs(pagination.page - 1)}
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
                    onClick={() => fetchJobs(pagination.page + 1)}
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

export default AdminJobs
