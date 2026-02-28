"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const errorMessages = {
  Configuration: "There's a problem with the server configuration. Please contact support.",
  AccessDenied: "Access was denied. You may have cancelled the sign-in or don't have permission.",
  Verification: "The verification link has expired or has already been used.",
  OAuthSignin: "Could not connect to the authentication provider. Please try again.",
  OAuthCallback: "Authentication failed. The callback from the provider was invalid.",
  OAuthCreateAccount: "Could not create an account with the provider. Try using email/password instead.",
  EmailCreateAccount: "Could not create an account with this email. It may already be registered.",
  Callback: "There was an error during authentication. Please try again.",
  OAuthAccountNotLinked: "This email is already registered with a different provider. Please sign in with the original method.",
  EmailSignin: "The sign-in email could not be sent. Please try again.",
  CredentialsSignin: "Sign in failed. Check your email and password are correct.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again."
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl">
              Global<span className="text-primary-600">Jobs</span>
            </span>
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
              <CardDescription className="mt-2">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-neutral-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-neutral-500">Error code: {error}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    Try Again
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-neutral-600">
                  Having trouble?{' '}
                  <Link href="/auth/register" className="text-primary-600 font-medium hover:underline">
                    Create a new account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Make sure you're using the correct login method (Google, LinkedIn, or Email)</li>
              <li>• Clear your browser cookies and try again</li>
              <li>• If using OAuth, ensure pop-ups are not blocked</li>
              <li>• Try signing up with a different email address</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

