import mongoose from 'mongoose'

const JobImpressionSchema = new mongoose.Schema({
  // Job reference - can be ObjectId for manual jobs or string for API jobs
  jobId: {
    type: mongoose.Schema.Types.Mixed, // Accepts both ObjectId and String
    required: true
  },

  // Job source to differentiate between manual and API jobs
  jobSource: {
    type: String,
    enum: ['manual', 'adzuna', 'jsearch', 'remotive', 'arbeitnow', 'themuse'],
    default: 'manual'
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Type of impression: view (from list), click (to detail page), etc
  type: {
    type: String,
    enum: ['view', 'click', 'search'],
    default: 'view'
  },
  // Where the impression came from
  source: {
    type: String,
    enum: ['search', 'listing', 'featured', 'recommendation', 'direct'],
    default: 'listing'
  },
  // Device and browser info
  userAgent: String,
  ipAddress: String,

  // For search impressions, track the search query
  searchQuery: String,

  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for efficient queries
JobImpressionSchema.index({ jobId: 1, timestamp: -1 })
JobImpressionSchema.index({ jobId: 1, type: 1 })
JobImpressionSchema.index({ user: 1, timestamp: -1 })
JobImpressionSchema.index({ timestamp: -1 })
JobImpressionSchema.index({ jobSource: 1 })

// Unique index for authenticated users - one impression per user per job per type
JobImpressionSchema.index(
  { jobId: 1, user: 1, type: 1 },
  { unique: true, sparse: true }
)

export default mongoose.models.JobImpression || mongoose.model('JobImpression', JobImpressionSchema)

