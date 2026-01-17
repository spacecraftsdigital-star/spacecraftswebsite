import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client lazily for browser (avoid server build-time errors when env is missing)
let supabase = null
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true // allow PKCE code exchange on callback
    }
  })
} else if (typeof window !== 'undefined') {
  // provide a minimal stub in browser during development when env not set
  supabase = {
    auth: {
      async signInWithPassword() { throw new Error('Supabase not configured') },
      async signInWithOAuth() { throw new Error('Supabase not configured') },
      getUser: async () => ({ data: { user: null } })
    },
    from: () => ({ select: async () => ({ data: [] }) })
  }
}

export { supabase }

// server-side helper using service role key (use only in server code for admin operations)
export function createSupabaseServerClient() {
  const { createClient } = require('@supabase/supabase-js')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role key or URL not configured')
  return createClient(url, key, {
    auth: {
      persistSession: false
    }
  })
}

// server-side helper for authenticated API routes (reads from cookies)
export function createSupabaseRouteHandlerClient(request) {
  const { createServerClient } = require('@supabase/ssr')
  const { cookies } = require('next/headers')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) throw new Error('Supabase URL or anon key not configured')
  
  const cookieStore = cookies()
  const authHeader = request.headers.get('authorization')
  
  return createServerClient(url, key, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {}
    },
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookie setting errors (e.g., in middleware)
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Handle cookie removal errors
        }
      }
    }
  })
}
