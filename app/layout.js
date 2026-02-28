import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Providers from '@/components/providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
})

export const metadata = {
  title: 'GlobalJobs - Find Your Dream Job Across The Globe',
  description: 'Access 500,000+ jobs and internships from 50+ countries with AI-powered recommendations. Your international career starts here.',
  keywords: 'jobs, internships, career, remote work, international jobs, AI job matching',
  openGraph: {
    title: 'GlobalJobs - International Job Portal',
    description: 'Access 500,000+ jobs and internships from 50+ countries with AI-powered recommendations.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

