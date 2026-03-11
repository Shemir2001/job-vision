'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import AdminNavbar from '@/components/admin/AdminNavbar'

const AdminLayout = ({ children }) => {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href) => pathname === href

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar for desktop */}
      <aside
        className={`hidden md:flex md:flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-slate-800 px-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JP</span>
            </div>
            {sidebarOpen && (
              <div className="hidden lg:block">
                <p className="font-bold text-gray-900 dark:text-white text-sm">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 dark:border-slate-800 px-3 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => await signOut({ redirect: true, callbackUrl: '/' })}
            className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>

        {/* Collapse/Expand Button */}
        <div className="border-t border-gray-200 dark:border-slate-800 px-3 py-4 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center"
          >
            {sidebarOpen ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 -rotate-90" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Navbar */}
        <AdminNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
