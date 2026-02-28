"use client"

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  FileText, 
  BookmarkIcon,
  Brain,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

const navLinks = [
  { href: '/jobs', label: 'Find Jobs', icon: Briefcase },
  { href: '/internships', label: 'Internships', icon: GraduationCap },
  { 
    label: 'AI Tools', 
    icon: Brain,
    children: [
      { href: '/ai/cv-analyzer', label: 'CV Analyzer', description: 'Get your resume analyzed by AI' },
      { href: '/ai/cover-letter', label: 'Cover Letter Generator', description: 'Create personalized cover letters' },
      { href: '/ai/interview-prep', label: 'Interview Prep', description: 'Practice with AI-generated questions' },
      { href: '/ai/career-coach', label: 'Career Coach', description: 'Get AI career guidance' },
    ]
  },
]

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false)
  const [mobileAiOpen, setMobileAiOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfileImage()
    }
  }, [session])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

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

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-primary-600 text-white p-2 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <span className="font-bold text-xl hidden sm:block">
              Global<span className="text-primary-600">Jobs</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.children ? (
                <DropdownMenu key={link.label} open={aiDropdownOpen} onOpenChange={setAiDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${aiDropdownOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-72">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary-600" />
                      AI-Powered Tools
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link href={child.href} className="flex flex-col items-start gap-0.5 py-2">
                          <span className="font-medium">{child.label}</span>
                          <span className="text-xs text-muted-foreground">{child.description}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" className="gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              )
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {status === 'loading' ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profileImage || session.user?.image} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {getInitials(session.user?.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block max-w-[100px] truncate">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{session.user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {session.user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/applications" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      My Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/saved" className="cursor-pointer">
                      <BookmarkIcon className="mr-2 h-4 w-4" />
                      Saved Jobs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer rendered via Portal to escape header stacking context ── */}
    </header>

    {mounted && createPortal(
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 z-[70] h-full w-[78vw] max-w-[320px] shadow-2xl lg:hidden flex flex-col"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-600 rounded-lg blur-sm opacity-50" />
                    <div className="relative bg-primary-600 text-white p-1.5 rounded-lg">
                      <Briefcase className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="font-bold text-lg">
                    Global<span className="text-primary-600">Jobs</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User info strip (if logged in) */}
              {session && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 px-5 py-4 bg-muted/50 border-b"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary-200">
                    <AvatarImage src={profileImage || session.user?.image} />
                    <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                      {getInitials(session.user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">{session.user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{session.user?.email}</span>
                  </div>
                </motion.div>
              )}

              {/* Nav Links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navLinks.map((link, i) =>
                  link.children ? (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                    >
                      <button
                        onClick={() => setMobileAiOpen(!mobileAiOpen)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950">
                            <link.icon className="h-4 w-4 text-primary-600" />
                          </span>
                          {link.label}
                        </span>
                        <motion.div
                          animate={{ rotate: mobileAiOpen ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {mobileAiOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-5 pr-2 pb-1 pt-0.5 space-y-0.5 border-l-2 border-primary-100 dark:border-primary-900 ml-6 mt-1">
                              {link.children.map((child, ci) => (
                                <motion.div
                                  key={child.href}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: ci * 0.05 }}
                                >
                                  <Link
                                    href={child.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                                  >
                                    <span className="text-sm font-medium">{child.label}</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">{child.description}</p>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950">
                          <link.icon className="h-4 w-4 text-primary-600" />
                        </span>
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}

                {/* Divider */}
                <div className="pt-2 border-t mt-2" />

                {/* Logged-in quick links */}
                {session && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-1"
                  >
                    {[
                      { href: '/dashboard', icon: User, label: 'Dashboard' },
                      { href: '/dashboard/applications', icon: FileText, label: 'My Applications' },
                      { href: '/dashboard/saved', icon: BookmarkIcon, label: 'Saved Jobs' },
                      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </nav>

              {/* Drawer Footer */}
              <div className="px-4 py-4 border-t space-y-2">
                {session ? (
                  <button
                    onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    , document.body)}
    </>
  )
}