import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import Post from "@/lib/models/Post"
import User from "@/lib/models/User"

// Middleware to check admin access
async function checkAdminAccess(session) {
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated" }
  }

  const user = await User.findById(session.user.id)
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return { authorized: false, error: "Not authorized" }
  }

  return { authorized: true, user }
}

// GET - Search across jobs, posts, users, and analytics
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized) {
      return Response.json({ error: access.error }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")?.trim() || ""
    const type = searchParams.get("type") || "all" // all, jobs, posts, users

    if (!query || query.length < 2) {
      return Response.json({
        results: [],
        message: "Please enter at least 2 characters to search"
      })
    }

    const results = {
      jobs: [],
      posts: [],
      users: [],
      total: 0
    }

    const searchRegex = { $regex: query, $options: "i" }

    // Search jobs (manually added only)
    if (type === "all" || type === "jobs") {
      results.jobs = await Job.find(
        {
          source: "manual",
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { "company.name": searchRegex },
            { category: searchRegex }
          ]
        },
        { title: 1, company: 1, location: 1, views: 1, createdAt: 1, _id: 1 }
      )
        .limit(5)
        .sort({ createdAt: -1 })
    }

    // Search posts
    if (type === "all" || type === "posts") {
      results.posts = await Post.find(
        {
          $or: [
            { title: searchRegex },
            { content: searchRegex },
            { category: searchRegex }
          ]
        },
        { title: 1, category: 1, status: 1, views: 1, createdAt: 1, slug: 1, _id: 1 }
      )
        .limit(5)
        .sort({ createdAt: -1 })
    }

    // Search users
    if (type === "all" || type === "users") {
      results.users = await User.find(
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex }
          ]
        },
        { name: 1, email: 1, role: 1, isAdmin: 1, createdAt: 1, _id: 1 }
      )
        .limit(5)
        .sort({ createdAt: -1 })
    }

    results.total = results.jobs.length + results.posts.length + results.users.length

    return Response.json(results)
  } catch (error) {
    console.error("Error searching:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
