import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Post from "@/lib/models/Post"
import User from "@/lib/models/User"

async function checkAdminAccess(session) {
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated" }
  }

  const user = await User.findById(session.user.id)
  if (!user?.isAdmin || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return { authorized: false, error: "Not authorized" }
  }

  return { authorized: true, user }
}

// PUT - Update post
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized || !access.user.adminPermissions?.canManagePosts) {
      return Response.json({ error: "Not authorized to manage posts" }, { status: 403 })
    }

    await connectDB()

    const { id } = params
    const body = await req.json()

    // If changing status to published, set publishedAt
    if (body.status === 'published') {
      body.publishedAt = new Date()
    }

    const post = await Post.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("author", "name email")

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    return Response.json(post)
  } catch (error) {
    console.error("Error updating post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete post
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized || !access.user.adminPermissions?.canManagePosts) {
      return Response.json({ error: "Not authorized to manage posts" }, { status: 403 })
    }

    await connectDB()

    const { id } = params

    const post = await Post.findByIdAndDelete(id)

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 })
    }

    return Response.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
