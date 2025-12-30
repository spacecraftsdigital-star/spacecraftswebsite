import { supabase } from '../../lib/supabaseClient'

export default async function AccountPage() {
  return (
    <div className="container">
      <h1>My Account</h1>
      <p>Profile, addresses, orders, and account settings will appear here.</p>
    </div>
  )
}
