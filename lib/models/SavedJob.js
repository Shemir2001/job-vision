import mongoose from 'mongoose'

const SavedJobSchema = new mongoose.Schema({
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
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Ensure one saved entry per user per job
SavedJobSchema.index({ user: 1, job: 1 }, { unique: true })
SavedJobSchema.index({ user: 1, savedAt: -1 })

export default mongoose.models.SavedJob || mongoose.model('SavedJob', SavedJobSchema)

