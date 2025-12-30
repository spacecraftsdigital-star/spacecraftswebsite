import { createSupabaseServerClient } from '../../../lib/supabaseClient'

export default async function OrderPage({ params }) {
  const { id } = params
  try {
    const supabase = createSupabaseServerClient()
    const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
    if (!order) return <div className="container">Order not found</div>
    return (
      <div className="container">
        <h1>Order #{order.id}</h1>
        <p>Status: {order.status}</p>
        <p>Tracking: {order.tracking_number || 'Not assigned yet'}</p>
      </div>
    )
  } catch (e) {
    return <div className="container">Order details not available (server DB not configured)</div>
  }
}
