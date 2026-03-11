'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Users, Edit2, Search, ChevronLeft, ChevronRight, Shield, ShieldOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'

const AdminUsers = () => {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const highlightRef = useRef(null)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 })
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Add blinking animation styles
  useEffect(() => {
    if (!highlightId) return

    const styleId = 'highlight-animation-users'
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
        tr.user-highlight-row {
          animation: blueBlink 0.8s infinite !important;
          background-color: #3b82f6 !important;
        }
        tr.user-highlight-row td {
          color: white !important;
          font-weight: 600 !important;
          background-color: transparent !important;
        }
        tr.user-highlight-row td span {
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

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search })
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [search])

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [highlightId, users])

  const handleSaveUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser._id,
          role: editingUser.role,
          adminPermissions: editingUser.adminPermissions
        })
      })

      if (!response.ok) throw new Error('Failed to update user')

      setShowEditModal(false)
      setEditingUser(null)
      fetchUsers(pagination.page)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users and admin roles</p>
        </div>

        {/* Search */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
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
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        ref={user._id === highlightId ? highlightRef : null}
                        className={user._id === highlightId ? 'user-highlight-row' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 dark:text-white">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' || user.role === 'superadmin'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            {user.role === 'superadmin' && (
                              <Shield className="w-3 h-3 mr-1" />
                            )}
                            {user.role === 'admin' && (
                              <ShieldOff className="w-3 h-3 mr-1" />
                            )}
                            <span className="capitalize">{user.role}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUser(user)
                                setShowEditModal(true)
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Edit2 className="w-4 h-4" />
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
                  Showing {users.length} of {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => fetchUsers(pagination.page - 1)}
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
                    onClick={() => fetchUsers(pagination.page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit User</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User: {editingUser.name}
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              {(editingUser.role === 'admin' || editingUser.role === 'superadmin') && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions</p>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.adminPermissions?.canManageJobs || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          adminPermissions: {
                            ...editingUser.adminPermissions,
                            canManageJobs: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Can Manage Jobs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.adminPermissions?.canManagePosts || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          adminPermissions: {
                            ...editingUser.adminPermissions,
                            canManagePosts: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Can Manage Posts</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.adminPermissions?.canManageUsers || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          adminPermissions: {
                            ...editingUser.adminPermissions,
                            canManageUsers: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Can Manage Users</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.adminPermissions?.canViewAnalytics || false}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          adminPermissions: {
                            ...editingUser.adminPermissions,
                            canViewAnalytics: e.target.checked
                          }
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Can View Analytics</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUser}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsers
