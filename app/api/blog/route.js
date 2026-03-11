import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Post from '@/lib/models/Post'

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    let query = { status: 'published' }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (category && category !== 'all') {
      query.category = category
    }

    const total = await Post.countDocuments(query)
    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching published posts:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
