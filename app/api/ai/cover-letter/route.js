import { NextResponse } from "next/server"
import { generateCoverLetter } from "@/lib/gemini"

export async function POST(request) {
  try {
    const { resumeData, jobData, tone = 'professional' } = await request.json()

    if (!resumeData || !jobData) {
      return NextResponse.json(
        { error: "Please provide resume and job information" },
        { status: 400 }
      )
    }

    const coverLetter = await generateCoverLetter(resumeData, jobData, tone)

    return NextResponse.json({
      success: true,
      coverLetter
    })
  } catch (error) {
    console.error("Cover letter generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    )
  }
}



