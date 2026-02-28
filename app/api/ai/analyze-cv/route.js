import { NextResponse } from "next/server"
import { analyzeResume } from "@/lib/gemini"

export async function POST(request) {
  try {
    const { resumeText } = await request.json()

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json(
        { error: "Please provide valid resume content" },
        { status: 400 }
      )
    }

    const analysis = await analyzeResume(resumeText)

    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error("CV Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze CV. Please try again." },
      { status: 500 }
    )
  }
}


