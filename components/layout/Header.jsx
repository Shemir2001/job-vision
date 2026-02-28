"use client"

import { useState, useEffect } from 'react'
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
const [profileImage, setProfileImage] = useState(null)
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
  return (
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
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t bg-background"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                link.children ? (
                  <div key={link.label} className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </div>
                    <div className="pl-6 space-y-1">
                      {link.children.map((child) => (
                        <Link 
                          key={child.href} 
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm hover:bg-muted rounded-lg"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              ))}
              {!session && (
                <div className="pt-4 border-t mt-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full mb-2">Sign In</Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}



