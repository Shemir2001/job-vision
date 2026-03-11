import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import BlogImpression from '@/lib/models/BlogImpression'
import Post from '@/lib/models/Post'

// POST - Record a blog impression
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { postId, impressionType = 'view' } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Verify post exists
    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userAgent = request.headers.get('user-agent')
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // For views only - prevent duplicates
    if (impressionType === 'view') {
      if (userId) {
        // For authenticated users - check if already viewed
        const existingView = await BlogImpression.findOne({
          post: postId,
          impressionType: 'view',
          user: userId
        }).lean()

        if (existingView) {
          // Already viewed, don't create or increment
          return NextResponse.json(
            { success: true, isNewView: false, message: 'Already viewed' },
            { status: 200 }
          )
        }

        // Create new view impression
        const impression = new BlogImpression({
          post: postId,
          impressionType: 'view',
          user: userId,
          userAgent: userAgent
        })

        await impression.save()

        // Increment post view count ONLY for new views
        await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } })

        return NextResponse.json(
          { success: true, isNewView: true },
          { status: 201 }
        )
      } else {
        // For anonymous users - one view per IP per 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const existingView = await BlogImpression.findOne({
          post: postId,
          impressionType: 'view',
          ipAddress: ipAddress,
          user: null,
          createdAt: { $gte: twentyFourHoursAgo }
        }).lean()

        if (existingView) {
          return NextResponse.json(
            { success: true, isNewView: false, message: 'Already viewed in last 24 hours' },
            { status: 200 }
          )
        }

        const impression = new BlogImpression({
          post: postId,
          impressionType: 'view',
          ipAddress: ipAddress,
          user: null,
          userAgent: userAgent
        })

        await impression.save()

        // Increment post view count ONLY for new views
        await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } })

        return NextResponse.json(
          { success: true, isNewView: true },
          { status: 201 }
        )
      }
    }

    // For non-view impressions (like, click, share) - prevent duplicates
    if (['like', 'click', 'share'].includes(impressionType)) {
      if (userId) {
        // For authenticated users - check if already made this impression
        const existingImpression = await BlogImpression.findOne({
          post: postId,
          impressionType,
          user: userId
        }).lean()

        if (existingImpression) {
          // Already made this impression, don't create or increment
          return NextResponse.json(
            { success: true, isNew: false, message: `Already ${impressionType}d` },
            { status: 200 }
          )
        }

        // Create new impression
        const impression = new BlogImpression({
          post: postId,
          impressionType,
          user: userId,
          userAgent: userAgent
        })

        await impression.save()

        // Increment the corresponding counter ONLY for new impressions
        if (impressionType === 'like') {
          await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } })
        }

        return NextResponse.json(
          { success: true, isNew: true, message: `${impressionType} recorded` },
          { status: 201 }
        )
      } else {
        // For anonymous users - one impression per IP per 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const existingImpression = await BlogImpression.findOne({
          post: postId,
          impressionType,
          ipAddress: ipAddress,
          user: null,
          createdAt: { $gte: twentyFourHoursAgo }
        }).lean()

        if (existingImpression) {
          return NextResponse.json(
            { success: true, isNew: false, message: `Already ${impressionType}d in last 24 hours` },
            { status: 200 }
          )
        }

        const impression = new BlogImpression({
          post: postId,
          impressionType,
          ipAddress: ipAddress,
          user: null,
          userAgent: userAgent
        })

        await impression.save()

        // Increment the corresponding counter ONLY for new impressions
        if (impressionType === 'like') {
          await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } })
        }

        return NextResponse.json(
          { success: true, isNew: true, message: `${impressionType} recorded` },
          { status: 201 }
        )
      }
    }
  } catch (error) {
    console.error('Error recording blog impression:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


// GET - Get blog stats
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get impression stats for the post
    const impressions = await BlogImpression.aggregate([
      { $match: { post: new require('mongoose').Types.ObjectId(postId) } },
      {
        $group: {
          _id: '$impressionType',
          count: { $sum: 1 }
        }
      }
    ])

    // Format the response
    const stats = {
      views: 0,
      clicks: 0,
      likes: 0,
      shares: 0,
      total: 0
    }

    impressions.forEach(item => {
      stats[item._id + 's'] = item.count
      stats.total += item.count
    })

    // Get post data with current view count
    const post = await Post.findById(postId).select('views likes shares').lean()

    return NextResponse.json({
      impressions: stats,
      post: post || { views: 0, likes: 0, shares: 0 }
    })
  } catch (error) {
    console.error('Error fetching blog stats:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
