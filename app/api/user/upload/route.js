import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db"
import User from "@/lib/models/User"
import cloudinary from "@/lib/cloudinary"

async function getUserId(session) {
  if (!session?.user?.email) return null
  await dbConnect()
  const user = await User.findOne({ email: session.user.email })
  return user?._id
}

// Helper function to extract public_id from Cloudinary URL
function getPublicIdFromUrl(url) {
  try {
    const parts = url.split('/')
    const filename = parts[parts.length - 1]
    const publicId = filename.split('.')[0]
    const folder = parts.slice(-2, -1)[0]
    return `${folder}/${publicId}`
  } catch (error) {
    return null
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getUserId(session)
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type') // 'image' or 'resume'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type and size
    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 })
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
        return NextResponse.json({ error: "Image must be less than 2MB" }, { status: 400 })
      }
    } else if (type === 'resume') {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ 
          error: "Resume must be PDF or Word document" 
        }, { status: 400 })
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        return NextResponse.json({ error: "Resume must be less than 5MB" }, { status: 400 })
      }
    }

    await dbConnect()
    const user = await User.findById(userId)

    // Delete old file from Cloudinary if exists
    if (type === 'image' && user.image) {
      const publicId = getPublicIdFromUrl(user.image)
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId)
        } catch (error) {
          console.error("Error deleting old image:", error)
        }
      }
    } else if (type === 'resume' && user.resume?.url) {
      const publicId = getPublicIdFromUrl(user.resume.url)
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
        } catch (error) {
          console.error("Error deleting old resume:", error)
        }
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: type === 'image' ? 'jobhunt/profile-images' : 'jobhunt/resumes',
        resource_type: type === 'image' ? 'image' : 'raw',
        use_filename: true,
        unique_filename: true,
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    const result = await uploadPromise

    // Update user record
    const updateData = type === 'image' 
      ? { image: result.secure_url }
      : { 
          resume: {
            url: result.secure_url,
            filename: file.name,
            uploadedAt: new Date(),
            parsedData: user.resume?.parsedData || null,
            atsScore: user.resume?.atsScore || null
          }
        }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password')

    return NextResponse.json({
      success: true,
      message: `${type === 'image' ? 'Profile image' : 'Resume'} uploaded successfully`,
      fileUrl: result.secure_url,
      user: updatedUser
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}