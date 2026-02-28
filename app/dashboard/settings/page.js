"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Bell,
  Shield,
  Loader2,
  Save,
  Upload,
  CheckCircle,
  AlertTriangle,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'
import { useRef } from 'react'
import { FileText, Download } from 'lucide-react'
export default function SettingsPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [saved, setSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
const [imageHovered, setImageHovered] = useState(false)
  // Form states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
    website: '',
    linkedinUrl: '',
    image: null  // Add this line
  })

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    alertFrequency: 'daily',
    remotePreference: 'any',
    jobTypes: [],
    industries: [],
    locations: [],
    salaryExpectation: {
      min: 0,
      max: 0,
      currency: 'USD'
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const imageInputRef = useRef(null)
  const resumeInputRef = useRef(null)
  const [resumeData, setResumeData] = useState(null)
  // Redirect if not authenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard/settings')
    }
  }, [authStatus, router])

  // Fetch user profile on mount
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchUserProfile()
    }
  }, [authStatus])

  const fetchUserProfile = async () => {
    setFetchingProfile(true)
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()

      if (response.ok) {
        const user = data.user
        
        // Set profile data
        setProfile({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
           location: user.location?.country || '',
          headline: user.headline || '',
          bio: user.bio || '',
          website: user.website || '',
          linkedinUrl: user.linkedinUrl || '',
          image: user.image || null  // Add this line
        })
        setResumeData(user.resume || null)
        // Set preferences
        if (user.preferences) {
          setPreferences({
            emailAlerts: user.preferences.emailAlerts ?? true,
            alertFrequency: user.preferences.alertFrequency || 'daily',
            remotePreference: user.preferences.remotePreference || 'any',
            jobTypes: user.preferences.jobTypes || [],
            industries: user.preferences.industries || [],
            locations: user.preferences.locations || [],
            salaryExpectation: user.preferences.salaryExpectation || {
              min: 0,
              max: 0,
              currency: 'USD'
            }
          })
        }
      } else {
        toast.error(data.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setFetchingProfile(false)
    }
  }

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      const data = await response.json()

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        toast.success('Preferences updated successfully!')
      } else {
        toast.error(data.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setPasswordLoading(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'image')
  
      const response = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      })
  
      const data = await response.json()
  
      if (response.ok) {
        toast.success('Profile image updated!')
        await fetchUserProfile()
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }
  
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    setUploadingResume(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'resume')
  
      const response = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      })
  
      const data = await response.json()
  
      if (response.ok) {
        toast.success('Resume uploaded successfully!')
        await fetchUserProfile()
      } else {
        toast.error(data.error || 'Failed to upload resume')
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      toast.error('Failed to upload resume')
    } finally {
      setUploadingResume(false)
      if (resumeInputRef.current) {
        resumeInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== session?.user?.email) {
      toast.error('Email confirmation does not match')
      return
    }

    setDeletingAccount(true)
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmEmail: deleteConfirmEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account deleted successfully')
        setDeleteDialogOpen(false)
        // Sign out and redirect
        setTimeout(() => {
          signOut({ callbackUrl: '/' })
        }, 1000)
      } else {
        toast.error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setDeletingAccount(false)
    }
  }

  if (authStatus === 'loading' || fetchingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
          <p className="text-neutral-600">Manage your account and preferences</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Bell className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Avatar Section */}
             {/* Avatar Section */}
{/* Avatar Section */}
<Card>
  <CardHeader>
    <CardTitle>Profile Picture</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center gap-6">
      <div 
        className="relative"
        onMouseEnter={() => setImageHovered(true)}
        onMouseLeave={() => setImageHovered(false)}
      >
        <Avatar className="h-24 w-24 cursor-pointer" onClick={() => imageInputRef.current?.click()}>
          <AvatarImage src={profile.image || session.user?.image} />
          <AvatarFallback className="bg-primary-100 text-primary-700 text-2xl">
            {getInitials(profile.name || session.user?.name || 'U')}
          </AvatarFallback>
        </Avatar>
        
        {/* Hover Overlay */}
        {imageHovered && (
          <div 
            className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center cursor-pointer transition-all"
            onClick={() => imageInputRef.current?.click()}
          >
            <div className="text-center">
              <Upload className="h-6 w-6 text-white mx-auto mb-1" />
              <p className="text-xs text-white font-medium">Change</p>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button 
          variant="outline" 
          className="mb-2"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {profile.image || session.user?.image ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
        <p className="text-sm text-neutral-500">
          JPG, GIF or PNG. Max size 2MB.
        </p>
        {(profile.image || session.user?.image) && (
          <p className="text-xs text-neutral-400 mt-1">
            Click on photo or button to change
          </p>
        )}
      </div>
    </div>
  </CardContent>
</Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          className="pl-10 bg-neutral-50"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="pl-10"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="pl-10"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="headline">Professional Headline</Label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        id="headline"
                        value={profile.headline}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                        className="pl-10"
                        placeholder="e.g., Senior Software Engineer at Tech Corp"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full mt-1 p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Tell us about yourself..."
                      maxLength={2000}
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      {profile.bio?.length || 0}/2000 characters
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="relative mt-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="website"
                          type="url"
                          value={profile.website}
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                          className="pl-10"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <div className="relative mt-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                          id="linkedin"
                          type="url"
                          value={profile.linkedinUrl}
                          onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                          className="pl-10"
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
{/* Resume Section */}
<Card>
  <CardHeader>
    <CardTitle>Resume</CardTitle>
    <CardDescription>Upload your resume for job applications</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {resumeData?.url ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{resumeData.filename}</p>
              <p className="text-xs text-neutral-500">
                Uploaded {new Date(resumeData.uploadedAt).toLocaleDateString()}
              </p>
              {resumeData.atsScore && (
                <p className="text-xs text-primary-600 font-medium mt-1">
                  ATS Score: {resumeData.atsScore}%
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(resumeData.url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-neutral-400 mb-3" />
          <p className="text-sm text-neutral-600 mb-4">
            No resume uploaded yet
          </p>
        </div>
      )}
      
      <input
        ref={resumeInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleResumeUpload}
        className="hidden"
      />
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => resumeInputRef.current?.click()}
        disabled={uploadingResume}
      >
        {uploadingResume ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {resumeData?.url ? 'Replace Resume' : 'Upload Resume'}
          </>
        )}
      </Button>
      <p className="text-xs text-neutral-500 text-center">
        PDF or Word document. Max size 5MB.
      </p>
    </div>
  </CardContent>
</Card>
              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={loading} className="gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Job Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>Set your job search preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Work Arrangement</Label>
                    <Select 
                      value={preferences.remotePreference}
                      onValueChange={(value) => setPreferences({ ...preferences, remotePreference: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any (Remote, Hybrid, On-site)</SelectItem>
                        <SelectItem value="remote">Remote Only</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Email Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Alerts</CardTitle>
                  <CardDescription>Manage your notification preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Job Alerts</p>
                      <p className="text-sm text-neutral-500">Receive emails about new job matches</p>
                    </div>
                    <Switch 
                      checked={preferences.emailAlerts}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, emailAlerts: checked })}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label>Alert Frequency</Label>
                    <Select 
                      value={preferences.alertFrequency}
                      onValueChange={(value) => setPreferences({ ...preferences, alertFrequency: value })}
                      disabled={!preferences.emailAlerts}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handlePreferencesSave} disabled={loading} className="gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saved ? 'Saved!' : 'Save Preferences'}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    {session.user?.provider && session.user.provider !== 'credentials'
                      ? `You signed in with ${session.user.provider}. Password change is not available for social login accounts.`
                      : 'Update your password to keep your account secure'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(!session.user?.provider || session.user.provider === 'credentials') ? (
                    <>
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input 
                          id="current-password" 
                          type="password" 
                          className="mt-1"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          className="mt-1"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <p className="text-xs text-neutral-500 mt-1">Minimum 8 characters</p>
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password" 
                          className="mt-1"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                      </div>
                      <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                        {passwordLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-neutral-600 py-4">
                      Password management is not available for accounts that signed in with Google or LinkedIn.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 mb-4">
                    Once you delete your account, there is no going back. All your data including saved jobs and applications will be permanently deleted.
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Delete Account Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription className="space-y-3">
                <p>
                  This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                </p>
                <p className="font-medium">
                  Please type <span className="text-destructive">{session?.user?.email}</span> to confirm.
                </p>
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Enter your email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setDeleteConfirmEmail('')
                }}
                disabled={deletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmEmail !== session?.user?.email}
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}