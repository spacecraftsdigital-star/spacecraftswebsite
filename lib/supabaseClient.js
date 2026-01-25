import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create browser client for client-side operations
let supabase = null
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
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
  const { createClient } = require('@supabase/supabase-js')
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) throw new Error('Supabase URL or anon key not configured')
  
  // Extract the auth token from cookies
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = {}
  
  if (cookieHeader) {
    const cookiePairs = cookieHeader.split(';')
    cookiePairs.forEach(pair => {
      const [nameWithPart, ...rest] = pair.split('=')
      const trimmedName = nameWithPart.trim()
      const trimmedValue = rest.join('=').trim()
      
      if (!trimmedName) return
      
      // Handle split cookies
      const baseMatch = trimmedName.match(/^(.+)\.\d+$/)
      if (baseMatch) {
        const baseName = baseMatch[1]
        if (!cookies[baseName]) {
          cookies[baseName] = ''
        }
        cookies[baseName] += trimmedValue
      } else {
        cookies[trimmedName] = trimmedValue
      }
    })
  }
  
  // Get the auth token and decode it
  const authTokenEncoded = cookies['sb-oduvaeykaeabnpmyliut-auth-token']
  let authToken = null
  
  if (authTokenEncoded) {
    try {
      const decoded = decodeURIComponent(authTokenEncoded)
      authToken = JSON.parse(decoded)
    } catch (e) {
      console.error('Failed to parse auth token:', e)
    }
  }
  
  // Create a Supabase client with the access token from the cookie
  const supabaseClient = createClient(url, key, {
    global: {
      headers: {
        Authorization: authToken?.access_token ? `Bearer ${authToken.access_token}` : ''
      }
    }
  })
  
  // Override getUser to use the token we extracted
  supabaseClient.auth.getUser = async () => {
    if (!authToken?.user) {
      return { 
        data: { user: null }, 
        error: { message: 'Auth session missing!' }
      }
    }
    return { data: { user: authToken.user }, error: null }
  }
  
  return supabaseClient
}
