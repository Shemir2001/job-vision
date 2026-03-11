import mongoose from 'mongoose'

const BlogImpressionSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Impression Details
  impressionType: {
    type: String,
    enum: ['view', 'click', 'like', 'share'],
    default: 'view'
  },

  // User Info (for anonymous users)
  ipAddress: String,
  userAgent: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create indexes for efficient queries
BlogImpressionSchema.index({ post: 1, createdAt: -1 })
BlogImpressionSchema.index({ post: 1, impressionType: 1 })
BlogImpressionSchema.index({ user: 1, post: 1 })
BlogImpressionSchema.index({ createdAt: -1 })

// Unique indexes for authenticated users - prevent duplicate impressions per type
// One view, one like, one click, one share per user per post forever
BlogImpressionSchema.index(
  { post: 1, user: 1, impressionType: 1 },
  { unique: true, sparse: true }
)

export default mongoose.models.BlogImpression || mongoose.model('BlogImpression', BlogImpressionSchema)
