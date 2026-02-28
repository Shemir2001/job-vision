import mongoose from 'mongoose'

const ApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  
  // Application Details
  status: {
    type: String,
    enum: ['applied', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  
  // Application Materials
  resume: {
    url: String,
    filename: String
  },
  coverLetter: {
    type: String,
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
  },
  
  // AI-Generated Content
  aiCoverLetter: String,
  aiMatchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  aiMatchAnalysis: {
    matchingSkills: [String],
    missingSkills: [String],
    strengthPoints: [String],
    improvementAreas: [String]
  },
  
  // Additional Info
  notes: String,
  answers: [{
    question: String,
    answer: String
  }],
  
  // Timeline
  appliedAt: {
    type: Date,
    default: Date.now
  },
  viewedAt: Date,
  shortlistedAt: Date,
  interviewAt: Date,
  offeredAt: Date,
  rejectedAt: Date,
  withdrawnAt: Date,
  
  // Interview Details
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'onsite', 'technical', 'behavioral']
    },
    scheduledAt: Date,
    notes: String,
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
})

// Ensure one application per user per job
ApplicationSchema.index({ user: 1, job: 1 }, { unique: true })
ApplicationSchema.index({ user: 1, status: 1 })
ApplicationSchema.index({ appliedAt: -1 })

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema)

