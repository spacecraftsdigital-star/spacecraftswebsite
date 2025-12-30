import { createSupabaseServerClient } from '../../lib/supabaseClient'

export default async function StoreLocator() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: stores } = await supabase.from('stores').select('*').limit(50)
    return (
      <div className="container">
        <h1>Store Locator</h1>
        <ul>
          {stores?.map(s => (
            <li key={s.id}><strong>{s.name}</strong> — {s.address}, {s.city} — {s.phone}</li>
          ))}
        </ul>
      </div>
    )
  } catch (e) {
    return (
      <div className="container">
        <h1>Store Locator</h1>
        <p>Store data not available (server DB not configured)</p>
      </div>
    )
  }
}
