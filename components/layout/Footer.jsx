import Link from 'next/link'
import { Briefcase, Mail, MapPin, Phone } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  'For Job Seekers': [
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'Browse Internships', href: '/internships' },
    { label: 'CV Analyzer', href: '/ai/cv-analyzer' },
    { label: 'Cover Letter Generator', href: '/ai/cover-letter' },
    { label: 'Interview Prep', href: '/ai/interview-prep' },
    { label: 'Career Coach', href: '/ai/career-coach' },
  ],
  'Job Categories': [
    { label: 'Technology', href: '/jobs?category=it-jobs' },
    { label: 'Engineering', href: '/jobs?category=engineering-jobs' },
    { label: 'Healthcare', href: '/jobs?category=healthcare-nursing-jobs' },
    { label: 'Marketing', href: '/jobs?category=marketing-jobs' },
    { label: 'Finance', href: '/jobs?category=accounting-finance-jobs' },
    { label: 'Remote Jobs', href: '/jobs?remote=true' },
  ],
  'Top Locations': [
    { label: 'United States', href: '/jobs?country=us' },
    { label: 'United Kingdom', href: '/jobs?country=gb' },
    { label: 'Canada', href: '/jobs?country=ca' },
    { label: 'Germany', href: '/jobs?country=de' },
    { label: 'Australia', href: '/jobs?country=au' },
    { label: 'Remote Worldwide', href: '/jobs?remote=true' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-white">
                Global<span className="text-primary-400">Jobs</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 mb-4">
              Your gateway to international career opportunities. Access 500,000+ jobs from 50+ countries with AI-powered job matching.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>support@globaljobs.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>Worldwide</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-neutral-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} GlobalJobs. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-neutral-500 hover:text-primary-400">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-neutral-500 hover:text-primary-400">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm text-neutral-500 hover:text-primary-400">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}



