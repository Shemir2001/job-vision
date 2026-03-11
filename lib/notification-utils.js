import Notification from '@/lib/models/Notification'

// Create notification for admin
export async function createAdminNotification(adminId, {
  type,
  title,
  message,
  reference = null,
  data = null
}) {
  try {
    const notification = new Notification({
      admin: adminId,
      type,
      title,
      message,
      reference,
      data,
      read: false
    })

    await notification.save()
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

// Notify all admins
export async function notifyAllAdmins(adminIds, notificationData) {
  try {
    const notifications = await Promise.all(
      adminIds.map(adminId =>
        createAdminNotification(adminId, notificationData)
      )
    )
    return notifications
  } catch (error) {
    console.error('Error notifying admins:', error)
    return []
  }
}

// Get all admin IDs
export async function getAllAdminIds() {
  try {
    const User = require('@/lib/models/User').default
    const admins = await User.find(
      { $or: [{ isAdmin: true }, { role: { $in: ['admin', 'superadmin'] } }] },
      '_id'
    ).lean()

    return admins.map(admin => admin._id)
  } catch (error) {
    console.error('Error fetching admin IDs:', error)
    return []
  }
}
