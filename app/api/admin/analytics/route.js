import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Job from "@/lib/models/Job"
import Post from "@/lib/models/Post"
import User from "@/lib/models/User"
import JobImpression from "@/lib/models/JobImpression"
import BlogImpression from "@/lib/models/BlogImpression"
import Application from "@/lib/models/Application"

async function checkAdminAccess(session) {
  if (!session?.user?.id) {
    return { authorized: false, error: "Not authenticated" }
  }

  const user = await User.findById(session.user.id)
  if (!user?.isAdmin || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return { authorized: false, error: "Not authorized" }
  }

  if (!user.adminPermissions?.canViewAnalytics) {
    return { authorized: false, error: "Not authorized to view analytics" }
  }

  return { authorized: true, user }
}

export async function GET(req) {
  try {
    await connectDB()
    
    const session = await getServerSession(authOptions)
    const access = await checkAdminAccess(session)
    if (!access.authorized) {
      return Response.json({ error: access.error }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get("timeRange") || "all" // all, 30days, 7days, today

    let dateFilter = {}
    const now = new Date()

    if (timeRange === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = { $gte: startOfDay }
    } else if (timeRange === "7days") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { $gte: sevenDaysAgo }
    } else if (timeRange === "30days") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { $gte: thirtyDaysAgo }
    }

    // Get total jobs and stats (ONLY MANUALLY ADDED JOBS)
    const totalJobs = await Job.countDocuments({ source: 'manual' })
    const activeJobs = await Job.countDocuments({ source: 'manual', isActive: true })
    const featuredJobs = await Job.countDocuments({ source: 'manual', isFeatured: true })

    // Get all manual job IDs to filter impressions and applications
    const manualJobIds = await Job.find({ source: 'manual' }).distinct('_id')
    const manualJobIdStrings = manualJobIds.map(id => id.toString())

    // Get total applications from Application collection for manual jobs
    const totalApplicationsCount = await Application.countDocuments({
      job: { $in: manualJobIds }
    })

    // Get total job views from JobImpression records for manual jobs only
    const jobViewsStats = await JobImpression.aggregate([
      {
        $match: {
          type: 'view',
          $or: [
            { jobId: { $in: manualJobIds } },
            { jobId: { $in: manualJobIdStrings } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 }
        }
      }
    ])

    // Get total posts and stats
    const totalPosts = await Post.countDocuments()
    const publishedPosts = await Post.countDocuments({ status: 'published' })
    const draftPosts = await Post.countDocuments({ status: 'draft' })

    // Get blog views from BlogImpression records
    const postViewsStats = await BlogImpression.aggregate([
      {
        $match: {
          impressionType: 'view',
          user: { $ne: null } // Only count authenticated users
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 }
        }
      }
    ])

    // Get blog likes and shares from BlogImpression records
    const postLikesStats = await BlogImpression.aggregate([
      {
        $match: {
          impressionType: 'like'
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: 1 }
        }
      }
    ])

    const postSharesStats = await BlogImpression.aggregate([
      {
        $match: {
          impressionType: 'share'
        }
      },
      {
        $group: {
          _id: null,
          totalShares: { $sum: 1 }
        }
      }
    ])

    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' })
    const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } })

    // Get jobs by category (ONLY MANUALLY ADDED)
    const jobsByCategory = await Job.aggregate([
      { $match: { source: 'manual' } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Get posts by category
    const postsByCategory = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Get jobs by type (ONLY MANUALLY ADDED)
    const jobsByType = await Job.aggregate([
      { $match: { source: 'manual' } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ])

    // Get 7-day trending data (ONLY MANUALLY ADDED JOBS)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const jobsTrending = await Job.aggregate([
      {
        $match: {
          source: 'manual',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const postsTrending = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Build 7-day trending array with all dates
    const trendingData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      const jobsCount = jobsTrending.find(j => j._id === dateStr)?.count || 0
      const postsCount = postsTrending.find(p => p._id === dateStr)?.count || 0

      trendingData.push({
        date: shortDate,
        fullDate: dateStr,
        jobs: jobsCount,
        posts: postsCount,
        views: jobsCount * 15 + postsCount * 10 // Calculate based on jobs and posts
      })
    }

    // Get recent jobs (ONLY MANUALLY ADDED) with real views and applications
    const recentJobDocs = await Job.find({ source: 'manual' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title company")
      .lean()

    // Fetch real views and applications for each recent job
    const recentJobs = await Promise.all(
      recentJobDocs.map(async (job) => {
        const jobIdStr = job._id.toString()

        // Get views from JobImpression collection
        const viewCount = await JobImpression.countDocuments({
          $or: [{ jobId: job._id }, { jobId: jobIdStr }],
          type: 'view'
        })

        // Get applications from Application collection
        const appCount = await Application.countDocuments({ job: job._id })

        return {
          _id: job._id,
          title: job.title,
          company: job.company,
          views: viewCount,
          applications: appCount
        }
      })
    )

    // Get recent posts
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name")
      .select("title status views")

    // Get comprehensive user analytics
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const usersLast60Days = await User.countDocuments({ createdAt: { $gte: sixtyDaysAgo } })
    const usersIn30to60Days = usersLast60Days - usersLast30Days

    // Calculate percentage change
    const userGrowthPercentage = usersIn30to60Days > 0
      ? Math.round(((usersLast30Days - usersIn30to60Days) / usersIn30to60Days) * 100)
      : 0

    // User growth trend (last 30 days)
    const userGrowthTrend = await User.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // User breakdown
    const verifiedUsers = await User.countDocuments({ emailVerified: { $ne: null } })
    const unverifiedUsers = totalUsers - verifiedUsers
    const usersWithEmail = await User.countDocuments({ email: { $exists: true, $ne: null } })

    return Response.json({
      trending: trendingData,
      jobs: {
        total: totalJobs,
        active: activeJobs,
        featured: featuredJobs,
        totalViews: jobViewsStats[0]?.totalViews || 0,
        totalApplications: totalApplicationsCount,
        byCategory: jobsByCategory,
        byType: jobsByType,
        recent: recentJobs
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
        totalViews: postViewsStats[0]?.totalViews || 0,
        totalLikes: postLikesStats[0]?.totalLikes || 0,
        totalShares: postSharesStats[0]?.totalShares || 0,
        byCategory: postsByCategory,
        recent: recentPosts
      },
      users: {
        total: totalUsers,
        admins: totalAdmins,
        regular: totalUsers - totalAdmins,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        withEmail: usersWithEmail,
        last30Days: usersLast30Days,
        growthPercentage: userGrowthPercentage,
        growthTrend: userGrowthTrend.map(item => ({
          date: item._id,
          newUsers: item.count
        }))
      }
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
