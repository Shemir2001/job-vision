import { NextResponse } from "next/server"
import { analyzeJobMatch } from "@/lib/gemini"

export async function POST(request) {
  try {
    const { resumeData, jobData } = await request.json()

    if (!resumeData || !jobData) {
      return NextResponse.json(
        { error: "Please provide resume and job information" },
        { status: 400 }
      )
    }

    const matchAnalysis = await analyzeJobMatch(resumeData, jobData)

    return NextResponse.json({
      success: true,
      matchAnalysis
    })
  } catch (error) {
    console.error("Job match analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze job match. Please try again." },
      { status: 500 }
    )
  }
}



