import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Initialize the model
function getModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
}

// Parse and analyze CV/Resume
export async function analyzeResume(resumeText) {
  const model = getModel()

  const prompt = `Analyze this resume/CV and provide a comprehensive analysis in JSON format:

Resume Content:
${resumeText}

Please provide analysis in this exact JSON structure:
{
  "extractedInfo": {
    "name": "Full name from resume",
    "email": "Email address",
    "phone": "Phone number",
    "location": "Location/Address",
    "linkedin": "LinkedIn URL if present",
    "website": "Portfolio/Website if present"
  },
  "professionalSummary": "A brief professional summary",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Employment duration",
      "highlights": ["Key achievements"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name",
      "year": "Graduation year"
    }
  ],
  "skills": {
    "technical": ["List of technical skills"],
    "soft": ["List of soft skills"],
    "languages": ["Languages spoken"]
  },
  "atsScore": 75,
  "strengths": ["List of resume strengths"],
  "weaknesses": ["List of areas to improve"],
  "suggestions": ["Specific improvement suggestions"],
  "keywordsMissing": ["Common industry keywords missing"],
  "overallAssessment": "Brief overall assessment of the resume"
}

Only return valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Resume analysis error:", error)
    throw error
  }
}

// Generate job match score and analysis
export async function analyzeJobMatch(resumeData, jobData) {
  const model = getModel()

  const prompt = `Analyze how well this candidate matches the job and provide a detailed analysis in JSON format:

Candidate Profile:
${JSON.stringify(resumeData, null, 2)}

Job Details:
Title: ${jobData.title}
Company: ${jobData.company?.name}
Description: ${jobData.description}
Requirements: ${jobData.requirements?.join(", ") || "Not specified"}
Skills needed: ${jobData.skills?.join(", ") || "Not specified"}

Provide analysis in this exact JSON structure:
{
  "matchScore": 85,
  "matchingSkills": ["Skills the candidate has that match the job"],
  "missingSkills": ["Skills the candidate lacks for this job"],
  "strengthPoints": ["Why the candidate is a good fit"],
  "improvementAreas": ["Areas where the candidate could improve"],
  "salaryEstimate": {
    "min": 50000,
    "max": 70000,
    "currency": "USD",
    "reasoning": "Brief explanation of salary estimate"
  },
  "interviewTips": ["Specific tips for this job interview"],
  "overallRecommendation": "Brief recommendation on whether to apply"
}

Only return valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Job match analysis error:", error)
    throw error
  }
}

// Generate personalized cover letter
export async function generateCoverLetter(resumeData, jobData, tone = "professional") {
  const model = getModel()

  const toneInstructions = {
    professional: "Write in a formal, professional tone suitable for corporate environments.",
    enthusiastic: "Write with enthusiasm and energy, showing genuine excitement for the role.",
    creative: "Write in a creative, unique style that stands out while remaining professional."
  }

  const prompt = `Generate a personalized cover letter for this job application:

Candidate Information:
${JSON.stringify(resumeData, null, 2)}

Job Details:
Title: ${jobData.title}
Company: ${jobData.company?.name}
Description: ${jobData.description}

Tone: ${toneInstructions[tone] || toneInstructions.professional}

Generate a cover letter in this JSON format:
{
  "subject": "Email subject line for the cover letter",
  "greeting": "Dear Hiring Manager,",
  "opening": "Strong opening paragraph that grabs attention",
  "body": "2-3 paragraphs highlighting relevant experience and skills",
  "closing": "Strong closing paragraph with call to action",
  "signature": "Professional sign-off",
  "fullText": "Complete cover letter as a single formatted text"
}

Only return valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Cover letter generation error:", error)
    throw error
  }
}

// Generate interview questions and tips
export async function generateInterviewPrep(jobData, industry = "") {
  const model = getModel()

  const prompt = `Generate comprehensive interview preparation materials for this job:

Job Details:
Title: ${jobData.title}
Company: ${jobData.company?.name || "Company"}
Description: ${jobData.description || ""}
Industry: ${industry || "General"}

Provide interview preparation in this JSON format:
{
  "commonQuestions": [
    {
      "question": "Interview question",
      "tip": "How to approach this question",
      "sampleAnswer": "A sample strong answer"
    }
  ],
  "technicalQuestions": [
    {
      "question": "Technical question related to the role",
      "tip": "Key points to cover",
      "sampleAnswer": "Technical answer example"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Behavioral question (STAR method)",
      "tip": "How to structure your answer",
      "sampleAnswer": "Sample STAR response"
    }
  ],
  "questionsToAsk": [
    "Smart questions to ask the interviewer"
  ],
  "preparationTips": [
    "General preparation advice"
  ],
  "commonMistakes": [
    "Mistakes to avoid"
  ],
  "dresscode": "Recommended dress code",
  "researchPoints": ["Key things to research about the company"]
}

Include at least 5 questions in each category. Only return valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Interview prep generation error:", error)
    throw error
  }
}

// Analyze skill gaps and career path
export async function analyzeCareerPath(resumeData, targetRole = "") {
  const model = getModel()

  const prompt = `Analyze the career path and skill gaps for this candidate:

Current Profile:
${JSON.stringify(resumeData, null, 2)}

Target Role: ${targetRole || "Career advancement"}

Provide career analysis in this JSON format:
{
  "currentLevel": "Entry/Mid/Senior/Lead level assessment",
  "suggestedPaths": [
    {
      "path": "Career path name",
      "description": "Brief description of this path",
      "requiredSkills": ["Skills needed"],
      "timeframe": "Estimated time to achieve",
      "steps": ["Step-by-step actions to take"]
    }
  ],
  "skillGaps": [
    {
      "skill": "Skill name",
      "importance": "High/Medium/Low",
      "howToAcquire": "Recommended way to learn this skill",
      "resources": ["Specific resources or courses"]
    }
  ],
  "industryInsights": {
    "trends": ["Current industry trends"],
    "inDemandSkills": ["Most in-demand skills"],
    "salaryRange": {
      "current": "Estimated current salary range",
      "target": "Target role salary range"
    }
  },
  "actionPlan": {
    "immediate": ["Actions for next 30 days"],
    "shortTerm": ["Actions for next 3-6 months"],
    "longTerm": ["Actions for next 1-2 years"]
  },
  "recommendations": ["Personalized career recommendations"]
}

Only return valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Career path analysis error:", error)
    throw error
  }
}

// AI Career Chat
export async function careerChat(message, conversationHistory = [], userContext = {}) {
  const model = getModel()

  const systemContext = `You are an expert AI career advisor. Help users with:
- Career guidance and planning
- Resume and cover letter advice
- Interview preparation
- Salary negotiation tips
- Industry insights
- Skill development recommendations

User Context:
${JSON.stringify(userContext, null, 2)}

Previous conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join("\n")}

Respond helpfully and professionally. Be specific and actionable in your advice.`

  const prompt = `${systemContext}

User: ${message}

Respond in a helpful, conversational manner. If appropriate, structure your response with clear sections or bullet points.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Career chat error:", error)
    throw error
  }
}

// Generate job recommendations based on profile
export async function getJobRecommendations(userProfile, availableJobs) {
  const model = getModel()

  const prompt = `Based on this user profile, rank and analyze these job opportunities:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Jobs (first 20):
${JSON.stringify(availableJobs.slice(0, 20), null, 2)}

Return a JSON array ranking the top 10 most suitable jobs with analysis:
{
  "recommendations": [
    {
      "jobIndex": 0,
      "matchScore": 85,
      "reasoning": "Why this job is a good match",
      "highlights": ["Key matching points"],
      "concerns": ["Potential concerns or gaps"]
    }
  ],
  "overallAdvice": "General job search advice for this user"
}

Only return valid JSON, no additional text.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Job recommendations error:", error)
    throw error
  }
}


