import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  image: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Date,
    default: null
  },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'linkedin'],
    default: 'credentials'
  },
  providerId: String,
  
  // Profile Information
  headline: {
    type: String,
    maxlength: [200, 'Headline cannot exceed 200 characters']
  },
  bio: {
    type: String,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  location: {

    country: String
  },
  phone: String,
  website: String,
  linkedinUrl: String,
  
  // Professional Information
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String
  }],
  
  education: [{
    degree: String,
    institution: String,
    field: String,
    startDate: Date,
    endDate: Date,
    grade: String
  }],
  profileImage: {
    type: String,
    default: null
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'professional', 'native']
    }
  }],
  
  // Resume/CV
  resume: {
    url: String,
    filename: String,
    uploadedAt: Date,
    parsedData: mongoose.Schema.Types.Mixed,
    atsScore: Number
  },
  
  // Preferences
  preferences: {
    jobTypes: [String],
    industries: [String],
    locations: [String],
    remotePreference: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite', 'any'],
      default: 'any'
    },
    salaryExpectation: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' }
    },
    emailAlerts: { type: Boolean, default: true },
    alertFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'instant'],
      default: 'daily'
    }
  },
  
  // Profile Completeness
  profileCompleteness: {
    type: Number,
    default: 0
  },
  
  // Saved Searches
  savedSearches: [{
    query: String,
    filters: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
  }],
  
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Calculate profile completeness
UserSchema.pre('save', function(next) {
  let score = 0
  const weights = {
    name: 10,
    email: 10,
    headline: 10,
    bio: 10,
    location: 10,
    experience: 15,
    education: 10,
    skills: 15,
    resume: 10
  }
  
  if (this.name) score += weights.name
  if (this.email) score += weights.email
  if (this.headline) score += weights.headline
  if (this.bio) score += weights.bio
  if (this.location?.city || this.location?.country) score += weights.location
  if (this.experience?.length > 0) score += weights.experience
  if (this.education?.length > 0) score += weights.education
  if (this.skills?.length > 0) score += weights.skills
  if (this.resume?.url) score += weights.resume
  
  this.profileCompleteness = score
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Create indexes (email already has unique:true which creates an index)
UserSchema.index({ 'skills.name': 1 })
UserSchema.index({ 'location.country': 1 })

export default mongoose.models.User || mongoose.model('User', UserSchema)

