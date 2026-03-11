'use client'

import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminLayout from '@/components/admin/AdminLayout'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'JobPortal',
    siteTagline: 'Find Your Dream Job',
    contactEmail: 'admin@jobportal.com',
    supportEmail: 'support@jobportal.com',
    maintenanceMode: false,
    jobApplicationApprovalRequired: false,
    autoPublishPosts: false
  })

  const [savedMessage, setSavedMessage] = useState('')

  const handleSave = () => {
    setSavedMessage('Settings saved successfully!')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure admin panel and platform settings</p>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-emerald-600 dark:text-emerald-400">{savedMessage}</p>
          </div>
        )}

        {/* General Settings */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">General Settings</h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Tagline
              </label>
              <input
                type="text"
                value={settings.siteTagline}
                onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Platform Settings */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Settings</h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Put platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Job Application Approval</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Require admin approval for job posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.jobApplicationApprovalRequired}
                  onChange={(e) => setSettings({ ...settings, jobApplicationApprovalRequired: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto-publish Posts</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically publish posts on creation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPublishPosts}
                  onChange={(e) => setSettings({ ...settings, autoPublishPosts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <div className="p-6 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="font-medium text-red-900 dark:text-red-200 mb-3">Clear All Cache</p>
              <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                This will clear all cached data and rebuild indexes. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900"
              >
                Clear Cache
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings
