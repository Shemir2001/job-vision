'use client'

import { useEffect, useState } from 'react'
import { Briefcase, FileText, Users, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Card } from '@/components/ui/card'
import AdminLayout from '@/components/admin/AdminLayout'

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    // Refresh analytics every 30 seconds for real-time updates
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

  const statCards = [
    {
      label: 'Total Jobs',
      value: analytics?.jobs?.total || 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Active Jobs',
      value: analytics?.jobs?.active || 0,
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      label: 'Published Posts',
      value: analytics?.posts?.published || 0,
      icon: FileText,
      color: 'violet',
    },
    {
      label: 'Total Users',
      value: analytics?.users?.total || 0,
      icon: Users,
      color: 'amber',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    violet: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    amber: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  }

  // Prepare chart data for jobs by category
  const jobsCategoryData = analytics?.jobs?.byCategory?.map(item => ({
    name: item._id || 'Uncategorized',
    value: item.count
  })) || []

  // Prepare chart data for posts by category
  const postsCategoryData = analytics?.posts?.byCategory?.map(item => ({
    name: item._id || 'Uncategorized',
    value: item.count
  })) || []

  // Prepare chart data for jobs by type
  const jobsTypeData = analytics?.jobs?.byType?.map(item => ({
    name: item._id || 'Uncategorized',
    value: item.count
  })) || []

  // Colors for pie charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6']

  // Use real trending data from API
  const trendingData = analytics?.trending || []

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time analytics and platform overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            const colorClass = colorClasses[stat.color]
            return (
              <Card key={index} className={`border ${colorClass}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Trending Chart - Line Chart */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              7-Day Trending Activity
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={trendingData}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => {
                    const labels = {
                      jobs: 'New Jobs',
                      posts: 'New Posts',
                      views: 'Total Views'
                    }
                    return [value, labels[name] || name]
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area type="monotone" dataKey="jobs" stroke="#3b82f6" fillOpacity={1} fill="url(#colorJobs)" name="New Jobs" />
                <Area type="monotone" dataKey="posts" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPosts)" name="New Posts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs by Category - Bar Chart */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Jobs by Category
              </h3>
              {jobsCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobsCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [value, 'Count']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </Card>

          {/* Jobs by Type - Pie Chart */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Jobs by Type Distribution
              </h3>
              {jobsTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobsTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobsTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [value, 'Count']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts by Category - Bar Chart */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Posts by Category
              </h3>
              {postsCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={postsCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [value, 'Count']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No posts data available
                </div>
              )}
            </div>
          </Card>

          {/* Key Metrics */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Engagement Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Job Views</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(analytics?.jobs?.totalViews || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-950 rounded-lg border border-violet-200 dark:border-violet-800">
                  <div>
                    <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Total Job Applications</p>
                  </div>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {(analytics?.jobs?.totalApplications || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Post Views</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {(analytics?.posts?.totalViews || 0).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Total Post Likes</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {(analytics?.posts?.totalLikes || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Jobs
              </h3>
              <div className="space-y-3">
                {analytics?.jobs?.recent && analytics.jobs.recent.length > 0 ? (
                  analytics.jobs.recent.map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-gray-100 dark:border-slate-700"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {job.applications} applications
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {job.views} views
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent jobs</p>
                )}
              </div>
            </div>
          </Card>

          {/* Recent Posts */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Posts
              </h3>
              <div className="space-y-3">
                {analytics?.posts?.recent && analytics.posts.recent.length > 0 ? (
                  analytics.posts.recent.map((post, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-gray-100 dark:border-slate-700"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {post.status === 'published' ? '✓ Published' : '○ ' + post.status}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {post.views} views
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent posts</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* User Analytics Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Analytics & Insights</h2>

          {/* User Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
              <div className="p-6">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Total Registered</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {(analytics?.users?.total || 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">100% of all users</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border border-emerald-200 dark:border-emerald-800">
              <div className="p-6">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">Last 30 Days</p>
                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                  {(analytics?.users?.last30Days || 0).toLocaleString()}
                </p>
                <p className={`text-xs mt-3 ${analytics?.users?.growthPercentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analytics?.users?.growthPercentage >= 0 ? '+' : ''}{analytics?.users?.growthPercentage || 0}% growth
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border border-violet-200 dark:border-violet-800">
              <div className="p-6">
                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2">Verified Users</p>
                <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                  {(analytics?.users?.verified || 0).toLocaleString()}
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 mt-3">
                  {analytics?.users?.total ? Math.round((analytics.users.verified / analytics.users.total) * 100) : 0}% verified
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
              <div className="p-6">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">Unverified Users</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {(analytics?.users?.unverified || 0).toLocaleString()}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
                  {analytics?.users?.total ? Math.round((analytics.users.unverified / analytics.users.total) * 100) : 0}% unverified
                </p>
              </div>
            </Card>
          </div>

          {/* User Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Regular Users</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {(analytics?.users?.regular || 0).toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${analytics?.users?.total ? (analytics.users.regular / analytics.users.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics?.users?.total ? Math.round((analytics.users.regular / analytics.users.total) * 100) : 0}% of total
                </p>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Admin Users</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {(analytics?.users?.admins || 0).toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${analytics?.users?.total ? (analytics.users.admins / analytics.users.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics?.users?.total ? Math.round((analytics.users.admins / analytics.users.total) * 100) : 0}% of total
                </p>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">Email Verified</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {(analytics?.users?.withEmail || 0).toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full"
                    style={{
                      width: `${analytics?.users?.total ? (analytics.users.withEmail / analytics.users.total) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {analytics?.users?.total ? Math.round((analytics.users.withEmail / analytics.users.total) * 100) : 0}% of total
                </p>
              </div>
            </Card>
          </div>

          {/* User Growth Chart */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                User Registration Trend (Last 30 Days)
              </h3>
              {analytics?.users?.growthTrend && analytics.users.growthTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analytics.users.growthTrend}>
                    <defs>
                      <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value) => [value, 'Count']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No user registration data available
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
