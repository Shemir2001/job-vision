'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const JobFormDialog = ({ open, onOpenChange, job, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: { name: '', logo: '', website: '', description: '', size: '', industry: '' },
    location: { city: '', state: '', country: '', address: '', isRemote: false },
    description: '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    skills: [],
    type: 'full-time',
    experienceLevel: 'mid',
    workArrangement: 'onsite',
    salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
    category: '',
    applyUrl: '',
    applicationDeadline: '',
    isFeatured: false
  })

  const [requirements, setRequirements] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [benefits, setBenefits] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (job) {
      setFormData(job)
      setRequirements(job.requirements?.join('\n') || '')
      setResponsibilities(job.responsibilities?.join('\n') || '')
      setBenefits(job.benefits?.join('\n') || '')
      setSkills(job.skills?.join(', ') || '')
    } else {
      resetForm()
    }
  }, [job, open])

  const resetForm = () => {
    setFormData({
      title: '',
      company: { name: '', logo: '', website: '', description: '', size: '', industry: '' },
      location: { city: '', state: '', country: '', address: '', isRemote: false },
      description: '',
      requirements: [],
      responsibilities: [],
      benefits: [],
      skills: [],
      type: 'full-time',
      experienceLevel: 'mid',
      workArrangement: 'onsite',
      salary: { min: '', max: '', currency: 'USD', period: 'yearly' },
      category: '',
      applyUrl: '',
      applicationDeadline: '',
      isFeatured: false
    })
    setRequirements('')
    setResponsibilities('')
    setBenefits('')
    setSkills('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        requirements: requirements.split('\n').filter(r => r.trim()),
        responsibilities: responsibilities.split('\n').filter(r => r.trim()),
        benefits: benefits.split('\n').filter(r => r.trim()),
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        salary: {
          min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
          max: formData.salary.max ? parseInt(formData.salary.max) : undefined,
          currency: formData.salary.currency,
          period: formData.salary.period
        }
      }

      const url = job ? `/api/admin/jobs/${job._id}` : '/api/admin/jobs'
      const method = job ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save job')
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {job ? 'Edit Job' : 'Post New Job'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Title*
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category*
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Technology, Design, Marketing, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Job Type*
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience Level*
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Name*
                </label>
                <input
                  type="text"
                  required
                  value={formData.company.name}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.company.website}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, website: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.company.logo}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, logo: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://logo.url"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company Size
                </label>
                <input
                  type="text"
                  value={formData.company.size}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, size: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50-100, 100-500, etc."
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                value={formData.company.description}
                onChange={(e) => setFormData({ ...formData, company: { ...formData.company, description: e.target.value } })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Brief company description"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country*
                </label>
                <input
                  type="text"
                  required
                  value={formData.location.country}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="United States"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.location.isRemote}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, isRemote: e.target.checked } })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remote Position</span>
                </label>
              </div>
            </div>
          </div>

          {/* Work Arrangement & Salary */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Work Arrangement & Salary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Work Arrangement*
                </label>
                <select
                  value={formData.workArrangement}
                  onChange={(e) => setFormData({ ...formData, workArrangement: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Salary
                </label>
                <input
                  type="number"
                  value={formData.salary.min}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, min: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Salary
                </label>
                <input
                  type="number"
                  value={formData.salary.max}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, max: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Period
                </label>
                <select
                  value={formData.salary.period}
                  onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, period: e.target.value } })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="yearly">Yearly</option>
                  <option value="monthly">Monthly</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Job Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description*
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
                placeholder="Full job description..."
              />
            </div>
          </div>

          {/* Requirements, Responsibilities, Benefits, Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requirements (one per line)
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows="5"
                placeholder="5 years React experience&#10;Nodejs knowledge&#10;etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsibilities (one per line)
              </label>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows="5"
                placeholder="Develop frontend features&#10;Code reviews&#10;etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Benefits (one per line)
              </label>
              <textarea
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows="5"
                placeholder="Health insurance&#10;401k matching&#10;etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills (comma separated)
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows="5"
                placeholder="React, Node.js, MongoDB, JavaScript"
              />
            </div>
          </div>

          {/* Apply URL & Additional Settings */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Additional Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apply URL*
                </label>
                <input
                  type="url"
                  required
                  value={formData.applyUrl}
                  onChange={(e) => setFormData({ ...formData, applyUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://company.com/apply"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Feature this job (highlight on homepage)</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
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
            className="bg-blue-600 dark:bg-primary-600 hover:bg-blue-700 dark:hover:bg-primary-700 text-white dark:text-white"
          >
            {loading ? 'Saving...' : job ? 'Update Job' : 'Post Job'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default JobFormDialog
