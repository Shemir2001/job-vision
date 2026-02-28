import { NextResponse } from "next/server"
import { generateInterviewPrep } from "@/lib/gemini"

export async function POST(request) {
  try {
    const { jobData, industry = '' } = await request.json()

    if (!jobData) {
      return NextResponse.json(
        { error: "Please provide job information" },
        { status: 400 }
      )
    }

    const interviewPrep = await generateInterviewPrep(jobData, industry)

    return NextResponse.json({
      success: true,
      interviewPrep
    })
  } catch (error) {
    console.error("Interview prep generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate interview preparation. Please try again." },
      { status: 500 }
    )
  }
}



