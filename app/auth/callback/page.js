'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange code for session (PKCE) if present
        const code = new URL(window.location.href).searchParams.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('Auth code exchange error:', exchangeError)
            router.push('/login?error=auth_failed')
            return
          }
        }

        // Now get the session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session?.user) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_failed')
          return
        }

        // User authenticated successfully; profile bootstrap happens in AuthProvider
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
