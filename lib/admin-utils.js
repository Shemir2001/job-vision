import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import User from '@/lib/models/User'

/**
 * Check if user is authenticated admin
 * @param {object} session - NextAuth session
 * @param {string} permission - Optional specific permission to check
 * @returns {object} { authorized: boolean, user: object, error: string }
 */
export async function checkAdminAuth(session, permission = null) {
  if (!session?.user?.id) {
    return { authorized: false, error: 'Not authenticated' }
  }

  try {
    const user = await User.findById(session.user.id)

    if (!user?.isAdmin || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return { authorized: false, error: 'Not authorized - admin access required' }
    }

    // Check specific permission if provided
    if (permission) {
      const hasPermission = user.adminPermissions?.[permission]
      if (!hasPermission && user.role !== 'superadmin') {
        return { authorized: false, error: `Not authorized - ${permission} required` }
      }
    }

    return { authorized: true, user }
  } catch (error) {
    console.error('Error checking admin auth:', error)
    return { authorized: false, error: 'Authentication check failed' }
  }
}

/**
 * Middleware for admin-only API routes
 */
export async function requireAdmin(req, permission = null) {
  const session = await getServerSession(authOptions)
  const result = await checkAdminAuth(session, permission)

  if (!result.authorized) {
    return {
      error: result.error,
      status: 403
    }
  }

  return {
    authorized: true,
    user: result.user,
    status: 200
  }
}

/**
 * Check if user has specific admin role
 */
export async function hasAdminRole(userId, requiredRole = 'admin') {
  try {
    const user = await User.findById(userId)
    const roleHierarchy = { user: 0, admin: 1, superadmin: 2 }
    const userRoleLevel = roleHierarchy[user?.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0
    return userRoleLevel >= requiredLevel
  } catch (error) {
    console.error('Error checking admin role:', error)
    return false
  }
}

/**
 * Get admin permissions for a user
 */
export async function getAdminPermissions(userId) {
  try {
    const user = await User.findById(userId)
    if (!user?.isAdmin) return null

    // Superadmin has all permissions
    if (user.role === 'superadmin') {
      return {
        canManageJobs: true,
        canManagePosts: true,
        canManageUsers: true,
        canViewAnalytics: true
      }
    }

    return user.adminPermissions || {
      canManageJobs: false,
      canManagePosts: false,
      canManageUsers: false,
      canViewAnalytics: false
    }
  } catch (error) {
    console.error('Error getting admin permissions:', error)
    return null
  }
}

/**
 * Convert user to admin with specific permissions
 */
export async function promoteToAdmin(userId, role = 'admin', permissions = {}) {
  try {
    const defaultPermissions = {
      canManageJobs: role === 'superadmin' || permissions.canManageJobs || false,
      canManagePosts: role === 'superadmin' || permissions.canManagePosts || false,
      canManageUsers: role === 'superadmin',
      canViewAnalytics: role === 'superadmin' || permissions.canViewAnalytics || false
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isAdmin: true,
        role: role,
        adminPermissions: defaultPermissions
      },
      { new: true }
    )

    return user
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    throw error
  }
}

/**
 * Remove admin privileges from user
 */
export async function revokeAdminAccess(userId) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isAdmin: false,
        role: 'user',
        adminPermissions: {
          canManageJobs: false,
          canManagePosts: false,
          canManageUsers: false,
          canViewAnalytics: false
        }
      },
      { new: true }
    )

    return user
  } catch (error) {
    console.error('Error revoking admin access:', error)
    throw error
  }
}
