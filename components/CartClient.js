"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CartClient() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      const userRes = await supabase.auth.getUser()
      const user = userRes?.data?.user || null
      setUser(user)
      if (user) {
        const { data } = await supabase.from('cart_items').select('*, products(*)').eq('profile_id', user.id)
        setItems(data || [])
      } else {
        const ls = localStorage.getItem('cart')
        setItems(ls ? JSON.parse(ls) : [])
      }
      setLoading(false)
    }
    fetchCart()
  }, [])

  useEffect(() => {
    // persist to localStorage for guests
    const persist = async () => {
      const userRes = await supabase.auth.getUser()
      const user = userRes?.data?.user || null
      if (!user) localStorage.setItem('cart', JSON.stringify(items))
    }
    persist()
  }, [items])

  const [user, setUser] = useState(null)

  const remove = (id) => setItems(items.filter(i => i.id !== id))

  const updateQty = (id, qty) => setItems(items.map(i => i.id === id ? { ...i, quantity: qty } : i))

  if (loading) return <div>Loading cart...</div>
  if (!items.length) return <div>Your cart is empty.</div>

  const subtotal = items.reduce((s, it) => s + ((it.products?.price || it.price || 0) * (it.quantity || 1)), 0)

  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id} style={{marginBottom:12}}>
            <div>{item.products?.name || item.name}</div>
            <div>Qty: <input type="number" value={item.quantity||1} min={1} onChange={e=>updateQty(item.id, Number(e.target.value))} /></div>
            <div>Price: ₹{(item.products?.price || item.price || 0)}</div>
            <button onClick={()=>remove(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div><strong>Subtotal:</strong> ₹{subtotal}</div>
      <form onSubmit={async (e)=>{
        e.preventDefault()
        // send full cart to server to create an order and Stripe Checkout session
          const payload = {
            profile_id: user?.id || null,
            items: items.map(it=>({ product_id: it.product_id || it.products?.id, quantity: it.quantity || 1 }))
          }
        const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await res.json()
        if (json.id && window) {
          const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
          stripe.redirectToCheckout({ sessionId: json.id })
        } else if (json.url) {
          window.location.href = json.url
        } else {
          alert(json.error || 'Unable to create checkout session')
        }
        }}>
        <button type="submit">Checkout</button>
      </form>
    </div>
  )
}
