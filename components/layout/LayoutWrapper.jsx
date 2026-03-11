'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()

  // Don't show Header and Footer on admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return children
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
