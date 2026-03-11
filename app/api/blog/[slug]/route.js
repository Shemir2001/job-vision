import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/lib/models/Post'

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { slug } = await params

    // Find the published post by slug
    const post = await Post.findOne({ slug, status: 'published' })
      .populate('author', 'name email')

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Return post WITHOUT incrementing views here
    // Views are tracked via /api/blog/impressions endpoint instead
    return NextResponse.json({ post }, { status: 200 })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
