'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Search,
  Bell,
  LogOut,
  Settings,
  User,
  Menu,
  X
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const AdminNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const searchInputRef = useRef(null)
  const notificationIntervalRef = useRef(null)

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true)
      const response = await fetch('/api/admin/notifications?limit=10&unreadOnly=false')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch notifications immediately on mount
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    notificationIntervalRef.current = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfileImage()
    }
  }, [session])

  const fetchProfileImage = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      if (response.ok && data.user?.image) {
        setProfileImage(data.user.image)
      }
    } catch (error) {
      console.error('Error fetching profile image:', error)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`)
        } else {
          console.error('Search failed')
        }
      } catch (error) {
        console.error('Search error:', error)
      }
      setSearchQuery('')
      setSearchSuggestions([])
      setSearchOpen(false)
    }
  }

  const handleSearchChange = async (value) => {
    setSearchQuery(value)

    if (value.length < 2) {
      setSearchSuggestions([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`/api/admin/search?q=${encodeURIComponent(value)}`)
      if (response.ok) {
        const data = await response.json()
        const suggestions = [
          ...data.jobs.map(j => ({ type: 'job', id: j._id, label: j.title, value: j.title })),
          ...data.posts.map(p => ({ type: 'post', id: p._id, slug: p.slug, label: p.title, value: p.title })),
          ...data.users.map(u => ({ type: 'user', id: u._id, label: u.name, value: u.name }))
        ]
        setSearchSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSearchSuggestions([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    let navigatePath = ''

    if (suggestion.type === 'job') {
      navigatePath = `/admin/jobs?highlighted=${suggestion.id}`
    } else if (suggestion.type === 'post') {
      navigatePath = `/admin/posts?highlighted=${suggestion.id}`
    } else if (suggestion.type === 'user') {
      navigatePath = `/admin/users?highlighted=${suggestion.id}`
    }

    setSearchQuery('')
    setSearchSuggestions([])
    setSearchOpen(false)

    if (navigatePath) {
      router.push(navigatePath)
    }
  }

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Menu Toggle + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative w-full"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search jobs, users, posts..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleSearch}
                    onBlur={() => {
                      setTimeout(() => {
                        if (!searchQuery) setSearchOpen(false)
                      }, 200)
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Search Suggestions Dropdown */}
                  <AnimatePresence>
                    {searchSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50"
                      >
                        <div className="max-h-96 overflow-y-auto">
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded">
                                  {suggestion.type}
                                </span>
                                <span className="text-sm text-gray-900 dark:text-white truncate">
                                  {suggestion.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors w-full justify-between"
                >
                  <Search className="w-5 h-5" />
                  <span className="text-sm">Search...</span>
                  <kbd className="hidden ml-auto text-xs px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded">⌘K</kbd>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Icons + Theme + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications {unreadCount > 0 && `(${unreadCount})`}</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                          <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleMarkAsRead(notif._id)}
                            className={`px-4 py-3 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                              !notif.read ? 'bg-blue-50 dark:bg-blue-950' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                notif.type === 'job_application' ? 'bg-blue-500' :
                                notif.type === 'new_user' ? 'bg-emerald-500' :
                                notif.type === 'job_view' ? 'bg-purple-500' :
                                'bg-amber-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white font-medium">{notif.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{notif.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString() + ' ' + new Date(notif.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profileImage || session?.user?.image} />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                    {getInitials(session?.user?.name || 'A')}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                  {session?.user?.name?.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
                    </div>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
