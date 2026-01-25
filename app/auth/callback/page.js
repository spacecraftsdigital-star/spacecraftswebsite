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
        const code = new URL(window.location.href).searchParams.get('code')
        console.log('Auth code present:', !!code)
        
        if (code) {
          console.log('Exchanging code for session...')
          const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
          console.log('Exchange result:', { error: exchangeError, data })
          
          if (exchangeError) {
            console.error('Auth code exchange error:', exchangeError)
            router.push('/login?error=auth_failed')
            return
          }
        }

        // Wait a moment for the session to be persisted
        console.log('Waiting for session to persist...')
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check the session
        console.log('Getting current session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check result:', { session: !!session, user: session?.user?.email, error })
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (!session?.user) {
          console.error('No user found after exchange')
          router.push('/login?error=no_user')
          return
        }

        console.log('Authentication successful, redirecting to account:', session.user.email)
        
        // Redirect to account
        router.push('/account')
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/login?error=callback_failed')
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
