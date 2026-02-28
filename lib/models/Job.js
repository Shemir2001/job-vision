import mongoose from 'mongoose'

const JobSchema = new mongoose.Schema({
  // External API reference
  externalId: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    enum: ['adzuna', 'jsearch', 'remotive', 'arbeitnow', 'themuse', 'manual'],
    required: true
  },
  
  // Basic Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  company: {
    name: { type: String, required: true },
    logo: String,
    website: String,
    description: String,
    size: String,
    industry: String
  },
  
  // Location
  location: {
    city: String,
    state: String,
    country: { type: String, required: true },
    address: String,
    isRemote: { type: Boolean, default: false }
  },
  
  // Job Details
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  skills: [String],
  
  // Employment Details
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'freelance'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  workArrangement: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'onsite'
  },
  
  // Salary
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  
  // Category
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  
  // Application
  applyUrl: {
    type: String,
    required: true
  },
  applicationDeadline: Date,
  
  // Metadata
  postedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  
  // Search optimization
  searchKeywords: [String],
  
  // Cache control
  lastFetchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Create indexes for search optimization
JobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' })
JobSchema.index({ 'location.country': 1 })
JobSchema.index({ 'location.city': 1 })
JobSchema.index({ category: 1 })
JobSchema.index({ type: 1 })
JobSchema.index({ experienceLevel: 1 })
JobSchema.index({ workArrangement: 1 })
JobSchema.index({ postedAt: -1 })
JobSchema.index({ 'salary.min': 1, 'salary.max': 1 })
JobSchema.index({ skills: 1 })
JobSchema.index({ externalId: 1, source: 1 })
JobSchema.index({ isActive: 1, postedAt: -1 })

export default mongoose.models.Job || mongoose.model('Job', JobSchema)

