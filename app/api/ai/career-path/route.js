import { NextResponse } from "next/server"
import { analyzeCareerPath } from "@/lib/gemini"

export async function POST(request) {
  try {
    const { resumeData, targetRole = '' } = await request.json()

    if (!resumeData) {
      return NextResponse.json(
        { error: "Please provide your profile information" },
        { status: 400 }
      )
    }

    const careerAnalysis = await analyzeCareerPath(resumeData, targetRole)

    return NextResponse.json({
      success: true,
      careerAnalysis
    })
  } catch (error) {
    console.error("Career path analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze career path. Please try again." },
      { status: 500 }
    )
  }
}



