import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Post from '@/lib/models/Post'
import BlogImpression from '@/lib/models/BlogImpression'

export async function POST(request, { params }) {
  try {
    await connectDB()

    const { slug } = await params
    const body = await request.json()
    const { liked } = body

    // Get user session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find post by slug
    const post = await Post.findOne({ slug, status: 'published' })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Handle like/unlike
    if (liked) {
      // User is liking the post - check if already liked
      const existingLike = await BlogImpression.findOne({
        post: post._id,
        impressionType: 'like',
        user: userId
      }).lean()

      if (existingLike) {
        // Already liked, don't increment again
        return NextResponse.json({
          success: true,
          liked: false,
          message: 'Already liked this post'
        }, { status: 200 })
      }

      // Create a new like impression record
      const impression = new BlogImpression({
        post: post._id,
        impressionType: 'like',
        user: userId,
        userAgent: request.headers.get('user-agent')
      })

      await impression.save()

      // Increment like count ONLY once
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { likes: 1 } },
        { new: true }
      ).lean()

      return NextResponse.json({
        success: true,
        liked: true,
        likes: updatedPost.likes
      })
    } else {
      // User is unliking the post
      const removed = await BlogImpression.findOneAndDelete({
        post: post._id,
        impressionType: 'like',
        user: userId
      })

      if (removed) {
        // Decrement like count
        const updatedPost = await Post.findByIdAndUpdate(
          post._id,
          { $inc: { likes: -1 } },
          { new: true }
        ).lean()

        return NextResponse.json({
          success: true,
          liked: false,
          likes: updatedPost.likes
        })
      } else {
        // User hadn't liked this post
        return NextResponse.json({
          success: false,
          message: 'You have not liked this post'
        }, { status: 400 })
      }
    }
  } catch (error) {
    console.error('Error updating post like:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
