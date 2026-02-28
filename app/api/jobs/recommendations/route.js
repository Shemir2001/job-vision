import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import Job from "@/lib/models/Job"

// Helper function to get MongoDB user ID from session
async function getUserId(session) {
  if (!session?.user?.email) return null
  await dbConnect()
  const user = await User.findOne({ email: session.user.email })
  return user?._id
}

// Extract skills from text (simple keyword extraction)
function extractSkills(text) {
  if (!text) return []
  
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'nodejs', 'angular', 
    'vue', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'sql', 'mongodb', 
    'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker', 
    'kubernetes', 'git', 'agile', 'scrum', 'rest', 'api', 'graphql',
    'machine learning', 'ai', 'data science', 'analytics', 'tensorflow',
    'pytorch', 'scikit-learn', 'pandas', 'numpy', 'flutter', 'react native',
    'django', 'flask', 'spring', 'express', 'fastapi', 'nextjs', 'next.js',
    'leadership', 'management', 'communication', 'problem solving',
    'teamwork', 'project management', 'devops', 'ci/cd', 'testing',
    'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'ui/ux',
    'frontend', 'backend', 'fullstack', 'full-stack', 'mobile', 'web',
    'cloud', 'security', 'blockchain', 'solidity', 'ethereum', 'web3'
  ]
  
  const lowerText = text.toLowerCase()
  return commonSkills.filter(skill => lowerText.includes(skill))
}

// Calculate match score between user and job
function calculateMatchScore(userProfile, job) {
  let score = 0
  let maxScore = 0
  
  // Extract user skills from resume, headline, and bio
  const userSkills = new Set([
    ...extractSkills(userProfile.resume?.parsedData?.text || ''),
    ...extractSkills(userProfile.headline || ''),
    ...extractSkills(userProfile.bio || ''),
    ...(userProfile.skills?.map(s => s.name.toLowerCase()) || [])
  ])
  
  // Extract job skills
  const jobSkills = new Set([
    ...(job.skills || []).map(s => s.toLowerCase()),
    ...extractSkills(job.title),
    ...extractSkills(job.description),
    ...extractSkills(job.requirements?.join(' ') || '')
  ])
  
  // Skill matching (40 points max)
  maxScore += 40
  if (userSkills.size > 0 && jobSkills.size > 0) {
    const matchingSkills = [...userSkills].filter(skill => 
      [...jobSkills].some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    )
    score += (matchingSkills.length / Math.max(userSkills.size, jobSkills.size)) * 40
  }
  
  // Location matching (15 points max)
  maxScore += 15
  if (userProfile.location?.country && job.location?.country) {
    if (userProfile.location.country.toLowerCase() === job.location.country.toLowerCase()) {
      score += 15
    } else if (job.location?.isRemote) {
      score += 10
    }
  } else if (job.location?.isRemote) {
    score += 15
  }
  
  // Work arrangement preference (15 points max)
  maxScore += 15
  if (userProfile.preferences?.remotePreference) {
    const pref = userProfile.preferences.remotePreference
    const arrangement = job.workArrangement || (job.location?.isRemote ? 'remote' : 'onsite')
    
    if (pref === 'any') {
      score += 15
    } else if (pref === arrangement) {
      score += 15
    } else if (pref === 'hybrid' && (arrangement === 'remote' || arrangement === 'hybrid')) {
      score += 10
    }
  } else {
    score += 10
  }
  
  // Job type matching (10 points max)
  maxScore += 10
  if (userProfile.preferences?.jobTypes?.length > 0) {
    const jobType = (job.type || 'full-time').toLowerCase()
    if (userProfile.preferences.jobTypes.some(t => t.toLowerCase() === jobType)) {
      score += 10
    }
  } else {
    score += 7
  }
  
  // Title/Headline similarity (20 points max)
  maxScore += 20
  if (userProfile.headline) {
    const headlineWords = userProfile.headline.toLowerCase().split(/\s+/)
    const titleWords = job.title.toLowerCase().split(/\s+/)
    const commonWords = headlineWords.filter(word => 
      word.length > 3 && titleWords.some(tw => tw.includes(word) || word.includes(tw))
    )
    score += (commonWords.length / Math.max(headlineWords.length, titleWords.length)) * 20
  }
  
  // Normalize to percentage
  return Math.min(Math.round((score / maxScore) * 100), 99)
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const userId = await getUserId(session)
    
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10

    await dbConnect()

    // Get user profile
    const userProfile = await User.findById(userId).select('-password')
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // Build query based on user preferences
    const query = { isActive: true }
    
    // Filter by job types if specified
    if (userProfile.preferences?.jobTypes?.length > 0) {
      query.type = { $in: userProfile.preferences.jobTypes }
    }
    
    // Filter by remote preference
    if (userProfile.preferences?.remotePreference === 'remote') {
      query['location.isRemote'] = true
    }
    
    // Get jobs (more than needed to filter and sort)
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .limit(limit * 3)
      .lean()

    // Calculate match scores for each job
    const jobsWithScores = jobs.map(job => ({
      ...job,
      matchScore: calculateMatchScore(userProfile, job)
    }))

    // Sort by match score and filter minimum threshold
    const recommendedJobs = jobsWithScores
      .filter(job => job.matchScore >= 30) // Minimum 30% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      jobs: recommendedJobs,
      total: recommendedJobs.length,
      userProfile: {
        hasResume: !!userProfile.resume?.url,
        hasHeadline: !!userProfile.headline,
        hasBio: !!userProfile.bio,
        hasPreferences: !!(userProfile.preferences?.jobTypes?.length > 0 || userProfile.preferences?.remotePreference)
      }
    })
  } catch (error) {
    console.error("Error fetching job recommendations:", error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    )
  }
}