import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import User from '@/lib/models/User'
import connectDB from '@/lib/db'

export const metadata = {
  title: 'Admin Panel | JobPortal',
  description: 'Manage jobs, posts, and users',
}

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  try {
    // Check if user is admin
    await connectDB()
    const user = await User.findById(session.user.id)

    if (!user?.isAdmin || (user.role !== 'admin' && user.role !== 'superadmin')) {
      redirect('/')
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
    redirect('/')
  }

  // Return only the admin content - no header, no footer
  // The admin layout component will handle its own layout
  return children
}
