// hooks/useSavedJobs.js

"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner' // or replace with your toast library
import { useRouter } from 'next/navigation'

export function useSavedJobs() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch saved jobs when user logs in
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSavedJobs()
    } else if (status === 'unauthenticated') {
      setSavedJobIds(new Set())
      setLoading(false)
    }
  }, [status])

  // Check for pending save after login
  useEffect(() => {
    if (status === 'authenticated' && typeof window !== 'undefined') {
      const pendingJob = sessionStorage.getItem('pendingSaveJob')
      if (pendingJob) {
        try {
          const job = JSON.parse(pendingJob)
          saveJob(job)
          sessionStorage.removeItem('pendingSaveJob')
        } catch (error) {
          console.error('Error processing pending save:', error)
        }
      }
    }
  }, [status])

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('/api/jobs/saved')
      if (response.ok) {
        const data = await response.json()
        // Extract externalIds from the populated job data
        const ids = new Set(
          data.savedJobs.map(savedJob => savedJob.job?.externalId).filter(Boolean)
        )
        setSavedJobIds(ids)
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveJob = async (job) => {
    // Check if user is logged in
    if (!session) {
      toast.error('Please log in to save jobs', {
        action: {
          label: 'Login',
          onClick: () => {
            // Store the job to save after login
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('pendingSaveJob', JSON.stringify(job))
              const currentPath = window.location.pathname + window.location.search
              router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
            }
          }
        },
        duration: 5000
      })
      return { success: false, requiresAuth: true }
    }

    // Check if already saved
    if (savedJobIds.has(job.externalId)) {
      toast.info('Job already saved')
      return { success: false, alreadySaved: true }
    }

    try {
      const response = await fetch('/api/jobs/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job }),
      })

      const data = await response.json()

      if (response.ok) {
        setSavedJobIds(prev => new Set([...prev, job.externalId]))
        toast.success('Job saved successfully!', {
          action: {
            label: 'View Saved Jobs',
            onClick: () => router.push('/dashboard/saved-jobs')
          }
        })
        return { success: true, data }
      } else if (response.status === 401) {
        toast.error('Please log in to save jobs', {
          action: {
            label: 'Login',
            onClick: () => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('pendingSaveJob', JSON.stringify(job))
                const currentPath = window.location.pathname + window.location.search
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
              }
            }
          }
        })
        return { success: false, requiresAuth: true }
      } else if (response.status === 409) {
        setSavedJobIds(prev => new Set([...prev, job.externalId]))
        toast.info('Job already saved')
        return { success: false, alreadySaved: true }
      } else {
        toast.error(data.error || 'Failed to save job')
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Failed to save job. Please try again.')
      return { success: false, error: error.message }
    }
  }

  const unsaveJob = async (externalId) => {
    if (!session) {
      toast.error('Please log in')
      return { success: false }
    }

    try {
      const response = await fetch(`/api/jobs/saved?externalId=${externalId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setSavedJobIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(externalId)
          return newSet
        })
        toast.success('Job removed from saved jobs')
        return { success: true }
      } else {
        toast.error(data.error || 'Failed to remove job')
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error removing saved job:', error)
      toast.error('Failed to remove job. Please try again.')
      return { success: false, error: error.message }
    }
  }

  const toggleSaveJob = async (job) => {
    if (savedJobIds.has(job.externalId)) {
      return await unsaveJob(job.externalId)
    } else {
      return await saveJob(job)
    }
  }

  const isJobSaved = (externalId) => {
    return savedJobIds.has(externalId)
  }

  const updateNotes = async (externalId, notes) => {
    if (!session) {
      toast.error('Please log in')
      return { success: false }
    }

    try {
      const response = await fetch('/api/jobs/saved', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ externalId, notes }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Notes updated successfully')
        return { success: true, data }
      } else {
        toast.error(data.error || 'Failed to update notes')
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      toast.error('Failed to update notes')
      return { success: false, error: error.message }
    }
  }

  return {
    savedJobIds,
    loading,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    isJobSaved,
    updateNotes,
    refetch: fetchSavedJobs
  }
}