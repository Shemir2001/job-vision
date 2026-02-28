import { NextResponse } from "next/server"
import { careerChat } from "@/lib/gemini"

export async function POST(request) {
  try {
    const { message, conversationHistory = [], userContext = {} } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Please provide a message" },
        { status: 400 }
      )
    }

    const response = await careerChat(message, conversationHistory, userContext)

    return NextResponse.json({
      success: true,
      response
    })
  } catch (error) {
    console.error("Career chat error:", error)
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    )
  }
}



