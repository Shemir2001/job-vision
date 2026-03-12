import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

async function checkAdminAccess(session, requireManageUsers = true) {
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated" }
  }

  const user = await User.findById(session.user.id)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return { authorized: false, error: "Not authorized" }
  }

  if (requireManageUsers && !user.adminPermissions?.canManageUsers) {
    return { authorized: false, error: "Not authorized to manage users" }
  }

  return { authorized: true, user }
}

// GET - Fetch all users
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session, false)
    if (!access.authorized) {
      return Response.json({ error: access.error }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const role = searchParams.get("role")

    let query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }

    if (role && ['user', 'admin', 'superadmin'].includes(role)) {
      query.role = role
    }

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    return Response.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update user (only superadmin can update roles/permissions)
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized) {
      return Response.json({ error: access.error }, { status: 403 })
    }

    await connectDB()

    const body = await req.json()
    const { userId, role, adminPermissions } = body

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 })
    }

    // Only superadmin can change roles
    if (role && access.user.role !== 'superadmin') {
      return Response.json({ error: "Only superadmins can change user roles" }, { status: 403 })
    }

    // Prevent modifying yourself
    if (userId === access.user._id.toString()) {
      return Response.json({ error: "You cannot modify your own role" }, { status: 400 })
    }

    // Build update object with proper isAdmin sync
    const updateData = {}

    if (role) {
      updateData.role = role

      if (role === 'admin' || role === 'superadmin') {
        // Promote: set isAdmin to true
        updateData.isAdmin = true

        // If adminPermissions are provided, use them; otherwise set defaults
        if (adminPermissions) {
          updateData.adminPermissions = adminPermissions
        }

        // Superadmins automatically get all permissions
        if (role === 'superadmin') {
          updateData.adminPermissions = {
            canManageJobs: true,
            canManagePosts: true,
            canManageUsers: true,
            canViewAnalytics: true
          }
        }
      } else {
        // Demote to regular user: clear admin status and permissions
        updateData.isAdmin = false
        updateData.adminPermissions = {
          canManageJobs: false,
          canManagePosts: false,
          canManageUsers: false,
          canViewAnalytics: false
        }
      }
    } else if (adminPermissions) {
      // If only permissions are being updated (no role change)
      updateData.adminPermissions = adminPermissions
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password")

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    return Response.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
