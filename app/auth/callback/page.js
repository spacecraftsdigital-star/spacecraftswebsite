'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback started')

        // Exchange code for session (PKCE) if present
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        console.log('Auth code present:', !!code)

        if (code) {
          console.log('Exchanging code for session...')
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.warn('Code exchange error (may have been auto-exchanged):', exchangeError.message)
            // Code might have been auto-exchanged by the Supabase client.
            // Fall through and check if a session already exists.
          }
        }

        // Check for hash-based tokens (implicit flow fallback)
        if (!code && window.location.hash) {
          console.log('Hash fragment detected, waiting for client to process...')
          await new Promise(resolve => setTimeout(resolve, 1500))
        }

        // Give cookies/storage a moment to persist
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check the session
        console.log('Getting current session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check result:', { session: !!session, user: session?.user?.email, error })

        if (error) {
          console.error('Auth callback error:', error)
        }

        if (session?.user) {
          console.log('Authentication successful, redirecting to account:', session.user.email)
          // Use hard redirect to ensure middleware sees fresh cookies
          window.location.href = '/account'
          return
        }

        // No session found — retry once after a longer wait
        console.log('No session found, retrying after delay...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        const { data: { session: retrySession } } = await supabase.auth.getSession()

        if (retrySession?.user) {
          console.log('Session found on retry, redirecting:', retrySession.user.email)
          window.location.href = '/account'
          return
        }

        console.error('No user found after retries')
        window.location.href = '/login?error=no_user'
      } catch (error) {
        console.error('Callback error:', error)
        window.location.href = '/login?error=callback_failed'
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}
