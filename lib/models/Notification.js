import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema({
  // Admin who receives the notification
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of notification
  type: {
    type: String,
    enum: ['new_user', 'job_application', 'job_view', 'job_click', 'new_job', 'job_featured'],
    required: true
  },

  // Title and message
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },

  // References to related documents
  reference: {
    model: String, // e.g., 'User', 'Job', 'Application'
    id: mongoose.Schema.Types.ObjectId
  },

  // Status
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Data for rich notifications
  data: mongoose.Schema.Types.Mixed,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
})

// Index for efficient queries
NotificationSchema.index({ admin: 1, read: 1, createdAt: -1 })
NotificationSchema.index({ admin: 1, createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
