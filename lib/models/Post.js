import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  featuredImage: {
    url: String,
    alt: String
  },

  // Metadata
  category: {
    type: String,
    enum: ['career-tips', 'industry-news', 'interview-prep', 'resume-guide', 'success-stories', 'company-spotlight', 'other'],
    default: 'other'
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Publishing
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },

  // SEO
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create indexes
PostSchema.index({ status: 1, publishedAt: -1 })
PostSchema.index({ category: 1 })
PostSchema.index({ author: 1 })
PostSchema.index({ 'title': 'text', 'content': 'text', 'tags': 'text' })

// Auto-generate slug from title before saving
PostSchema.pre('save', function(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  next()
})

export default mongoose.models.Post || mongoose.model('Post', PostSchema)
