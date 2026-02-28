import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import LinkedInProvider from "next-auth/providers/linkedin"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
console.log("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID)
console.log("LINKEDIN_CLIENT_ID", process.env.LINKEDIN_CLIENT_ID)

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            throw new Error("Please enter your email and password")
          }

          console.log("Attempting to authenticate:", credentials.email)
          await connectDB()

          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password")
          console.log("User found:", !!user)

          if (!user) {
            throw new Error("No user found with this email")
          }

          if (!user.password) {
            throw new Error("Please sign in with your social account")
          }

          const isPasswordValid = await user.comparePassword(credentials.password)
          console.log("Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image
          }
        } catch (error) {
          console.error("Authorize error:", error.message)
          throw error
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    LinkedInProvider({
      clientId:  "77lazhzs5hii81",
      clientSecret:  "WPL_AP1.h4dxWVC4Wup7fuCc.ZWxHOQ==",
      authorization: {
        params: { scope: "openid profile email" },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback - provider:", account?.provider, "email:", user?.email)
      
      if (account?.provider === "google" || account?.provider === "linkedin") {
        try {
          await connectDB()

          const existingUser = await User.findOne({ email: user.email?.toLowerCase() })

          if (!existingUser) {
            console.log("Creating new user from OAuth:", user.email)
            const newUser = await User.create({
              name: user.name,
              email: user.email?.toLowerCase(),
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
              emailVerified: new Date()
            })
            // Store MongoDB _id for new user
            user.id = newUser._id.toString()
          } else {
            console.log("Existing user found:", existingUser.email)
            // Update user image if changed
            if (user.image && existingUser.image !== user.image) {
              existingUser.image = user.image
              await existingUser.save()
            }
            // Store MongoDB _id for existing user
            user.id = existingUser._id.toString()
          }
        } catch (error) {
          console.error("SignIn callback error:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // When user signs in, store their MongoDB _id
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      
      // For OAuth users, ensure we have the MongoDB _id
      if (token.email && !token.id) {
        try {
          await connectDB()
          const dbUser = await User.findOne({ email: token.email.toLowerCase() })
          if (dbUser) {
            token.id = dbUser._id.toString()
          }
        } catch (error) {
          console.error("JWT callback error:", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.provider = token.provider
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }