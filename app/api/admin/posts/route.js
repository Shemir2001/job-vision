import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Post from "@/lib/models/Post"
import User from "@/lib/models/User"

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

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

// GET - Fetch all posts
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized) {
      return Response.json({ error: access.error }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const status = searchParams.get("status") // draft, published, archived
    const category = searchParams.get("category")

    let query = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } }
      ]
    }

    if (status) {
      query.status = status
    }

    if (category) {
      query.category = category
    }

    const total = await Post.countDocuments(query)
    const posts = await Post.find(query)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    return Response.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new post
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized || !access.user.adminPermissions?.canManagePosts) {
      return Response.json({ error: "Not authorized to manage posts" }, { status: 403 })
    }

    await connectDB()

    const body = await req.json()

    // Validate required fields
    const required = ["title", "content"]
    for (const field of required) {
      if (!body[field]) {
        return Response.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Generate slug from title if not provided
    const slug = body.slug || generateSlug(body.title)

    const post = new Post({
      ...body,
      slug,
      author: access.user._id,
      publishedAt: body.status === 'published' ? new Date() : null,
      status: body.status || 'draft'
    })

    await post.save()

    return Response.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
