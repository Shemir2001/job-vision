# GlobalJobs - International Job Portal

A fully functional, production-ready international job portal that aggregates real-time job listings and internships from multiple countries worldwide using real APIs. Features cutting-edge AI capabilities powered by Google Gemini, stunning UI/UX design, and comprehensive job search functionality.

![GlobalJobs](https://via.placeholder.com/1200x600/3b82f6/ffffff?text=GlobalJobs+-+International+Job+Portal)

## Features

### 🌍 Global Job Search
- **500,000+ Jobs** from 50+ countries
- Real-time aggregation from multiple job APIs (Adzuna, JSearch, Remotive, Arbeitnow)
- Advanced filtering by location, category, job type, experience level, and salary
- Remote job filtering
- Internship dedicated section

### 🤖 AI-Powered Features (Gemini)
- **CV/Resume Analyzer**: Get ATS score, improvement suggestions, and keyword recommendations
- **Job Matching Engine**: AI-powered algorithm matching skills with job opportunities
- **Cover Letter Generator**: Create personalized cover letters for specific jobs
- **Interview Preparation**: AI-generated interview questions with tips and sample answers
- **Career Coach**: Interactive AI chat for career guidance
- **Skill Gap Analysis**: Identify missing skills for desired roles

### 👤 User Features
- User authentication (Email, Google OAuth, LinkedIn OAuth)
- User dashboard with application tracking
- Saved jobs management
- Profile management
- Email alerts for job matches

### 🎨 Modern Design
- Clean, professional UI with Tailwind CSS
- Responsive mobile-first design
- Smooth animations with Framer Motion
- shadcn/ui components
- Beautiful typography with DM Sans

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js

### AI
- **Provider**: Google Gemini AI

### Job APIs
- Adzuna API
- JSearch API (RapidAPI)
- Remotive API
- Arbeitnow API

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- API keys for job services and Gemini

### Installation

1. Clone the repository:
```bash
cd jobportal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Job APIs
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_APP_KEY=your-adzuna-app-key
JSEARCH_API_KEY=your-jsearch-rapidapi-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── internships/
│   │   └── ai/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── jobs/
│   │   └── [id]/
│   ├── internships/
│   ├── ai/
│   │   ├── cv-analyzer/
│   │   ├── cover-letter/
│   │   ├── interview-prep/
│   │   └── career-coach/
│   ├── dashboard/
│   │   ├── applications/
│   │   ├── saved/
│   │   └── settings/
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── components/
│   ├── home/
│   ├── layout/
│   ├── ui/
│   └── providers.jsx
├── lib/
│   ├── models/
│   ├── auth.js
│   ├── db.js
│   ├── gemini.js
│   ├── job-apis.js
│   └── utils.js
└── ...
```

## API Keys Setup

### Adzuna API
1. Sign up at [Adzuna Developers](https://developer.adzuna.com/)
2. Create an application to get APP_ID and APP_KEY

### JSearch API
1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
3. Copy your API key

### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials

### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create an application
3. Get Client ID and Secret

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@globaljobs.com or open an issue.

---

Built with ❤️ using Next.js, Tailwind CSS, and AI



