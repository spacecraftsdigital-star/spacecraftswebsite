import { supabase } from '../../lib/supabaseClient'

export default async function CheckoutPage() {
  return (
    <div className="container">
      <h1>Checkout</h1>
      <p>Select address, payment method, and confirm your order.</p>
    </div>
  )
}
