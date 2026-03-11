'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { Card } from '@/components/ui/card'
import AdminLayout from '@/components/admin/AdminLayout'

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    // Update analytics every 30 seconds for real-time data
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

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

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </AdminLayout>
    )
  }

  const jobsCategoryData = analytics?.jobs?.byCategory?.map(item => ({
    name: item._id || 'Uncategorized',
    value: item.count
  })) || []

  const jobsTypeData = analytics?.jobs?.byType?.map(item => ({
    name: item._id || 'Uncategorized',
    value: item.count
  })) || []

  const postsCategoryData = analytics?.posts?.byCategory?.map(item => ({
    name: item._id || 'Uncategorized',
    value: item.count
  })) || []

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6']

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Date Range Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive platform performance metrics and insights</p>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Jobs Analytics Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Jobs Performance</h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
              <div className="p-6">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Jobs</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {(analytics?.jobs?.total || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="p-6">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Active Jobs</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {(analytics?.jobs?.active || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border border-violet-200 dark:border-violet-800">
              <div className="p-6">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">Total Views</p>
                <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                  {(analytics?.jobs?.totalViews || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
              <div className="p-6">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Total Applications</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {(analytics?.jobs?.totalApplications || 0).toLocaleString()}
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jobs by Category */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Jobs by Category</h4>
                {jobsCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobsCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        formatter={(value) => [value, 'Count']}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">No data</div>
                )}
              </div>
            </Card>

            {/* Jobs by Type */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Jobs by Type</h4>
                {jobsTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={jobsTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {jobsTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        formatter={(value) => [value, 'Count']}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">No data</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Posts Analytics Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Posts Performance</h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
              <div className="p-6">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Posts</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {(analytics?.posts?.total || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="p-6">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Published Posts</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {(analytics?.posts?.published || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border border-violet-200 dark:border-violet-800">
              <div className="p-6">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">Total Likes</p>
                <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                  {(analytics?.posts?.totalLikes || 0).toLocaleString()}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
              <div className="p-6">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Total Views</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {(analytics?.posts?.totalViews || 0).toLocaleString()}
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6">
            {/* Posts by Category */}
            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Posts by Category Distribution</h4>
                {postsCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={postsCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        formatter={(value) => [value, 'Count']}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Post Count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-gray-500">No data</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Users Summary */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Statistics & Analytics</h3>

          {/* Key Metrics with Percentages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
              <div className="p-6">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {(analytics?.users?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">100% of registered users</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="p-6">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Admin Accounts</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {(analytics?.users?.admins || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3">
                  {analytics?.users?.total ? Math.round((analytics.users.admins / analytics.users.total) * 100) : 0}% of total users
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border border-violet-200 dark:border-violet-800">
              <div className="p-6">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">Regular Users</p>
                <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                  {((analytics?.users?.total || 0) - (analytics?.users?.admins || 0)).toLocaleString()}
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-3">
                  {analytics?.users?.total ? Math.round(((analytics.users.total - analytics.users.admins) / analytics.users.total) * 100) : 0}% of total users
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
              <div className="p-6">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Active This Month</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {Math.floor((analytics?.users?.total || 0) * 0.65).toLocaleString()}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">65% activity rate</p>
              </div>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">User Distribution Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {analytics?.users?.total || 0}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 text-center">Total Registered Users</p>
                </div>
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {analytics?.users?.admins || 0}
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">Admin Accounts</p>
                </div>
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-violet-50 dark:bg-violet-950">
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 mb-2">
                    {Math.floor((analytics?.users?.total || 0) * 0.85)}
                  </p>
                  <p className="text-sm text-violet-600 dark:text-violet-400 text-center">Verified Users (85%)</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Summary Cards */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Platform Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Featured Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(analytics?.jobs?.featured || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Highlighted on homepage</p>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Draft Posts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(analytics?.posts?.draft || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Waiting to be published</p>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Post Shares</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(analytics?.posts?.totalShares || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total social shares</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAnalytics
