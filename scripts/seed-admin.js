import 'dotenv/config.js'
import User from '../lib/models/User.js'
import connectDB from '../lib/db.js'

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await connectDB()
    console.log('✓ Connected to MongoDB')

    // Check if admin email is provided
    if (!process.env.ADMIN_EMAIL) {
      console.error('✗ Error: ADMIN_EMAIL environment variable is required')
      console.log('Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password123 node scripts/seed-admin.js')
      process.exit(1)
    }

    const adminEmail = process.env.ADMIN_EMAIL

    // Check if user exists
    const existingUser = await User.findOne({ email: adminEmail })

    if (existingUser) {
      // Update existing user to admin
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'

      // Use save() to trigger password hashing
      existingUser.isAdmin = true
      existingUser.role = 'superadmin'
      existingUser.password = adminPassword
      existingUser.adminPermissions = {
        canManageJobs: true,
        canManagePosts: true,
        canManageUsers: true,
        canViewAnalytics: true
      }
      await existingUser.save()

      console.log(`✓ Updated existing user ${adminEmail} to superadmin`)
      console.log(`  Password set to: ${adminPassword}`)
    } else {
      // Create new admin user if doesn't exist
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456'

      const newAdmin = await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: adminEmail,
        password: adminPassword,
        headline: 'Platform Administrator',
        isAdmin: true,
        role: 'superadmin',
        adminPermissions: {
          canManageJobs: true,
          canManagePosts: true,
          canManageUsers: true,
          canViewAnalytics: true
        }
      })

      console.log(`✓ Created new admin user: ${adminEmail}`)
      console.log(`  Password: ${adminPassword}`)
      console.log('  ⚠️  Change this password on first login!')
    }

    console.log('\n✓ Admin setup completed successfully!')
    console.log(`  Admin URL: http://localhost:3000/admin`)
    console.log(`  Email: ${adminEmail}`)

    process.exit(0)
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message)
    process.exit(1)
  }
}

// Run the seed function
seedAdmin()