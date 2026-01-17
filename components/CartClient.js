"use client"
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function CartClient() {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({ subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)

  const fetchCart = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || null
      setSessionToken(token)

      if (!token) {
        // guest cart from localStorage
        const ls = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
        const guestItems = ls ? JSON.parse(ls) : []
        setItems(guestItems)
        const guestSubtotal = guestItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
        setSummary({ subtotal: guestSubtotal, discount: 0, tax: 0, shipping: 0, total: guestSubtotal })
      } else {
        const res = await fetch('/api/cart/get', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load cart')
        setItems(data.items || [])
        setSummary(data.summary || { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 })
      }
    } catch (err) {
      console.error('Cart fetch error', err)
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const persistGuestCart = (nextItems) => {
    if (sessionToken) return
    if (typeof window === 'undefined') return
    localStorage.setItem('cart', JSON.stringify(nextItems))
  }

  const handleUpdateQty = async (product_id, quantity) => {
    if (quantity < 1) quantity = 1
    setUpdatingId(product_id)
    setError(null)

    if (!sessionToken) {
      const next = items.map(it => it.product_id === product_id ? { ...it, quantity } : it)
      setItems(next)
      persistGuestCart(next)
      setUpdatingId(null)
      return
    }

    try {
      const res = await fetch('/api/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ product_id, quantity })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update item')
      await fetchCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (product_id) => {
    setUpdatingId(product_id)
    setError(null)

    if (!sessionToken) {
      const next = items.filter(it => it.product_id !== product_id)
      setItems(next)
      persistGuestCart(next)
      setUpdatingId(null)
      return
    }

    try {
      const res = await fetch(`/api/cart/remove?product_id=${product_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionToken}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove item')
      await fetchCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const totals = useMemo(() => summary, [summary])

  if (loading) return <div className="cart-state">Loading cart...</div>
  if (!items.length) return <div className="cart-state">Your cart is empty.</div>

  return (
    <div className="cart-page">
      <div className="cart-grid">
        <div className="cart-list">
          {items.map(item => {
            const price = item.price || item.originalPrice || item.products?.discount_price || item.products?.price || 0
            const mrp = item.originalPrice || item.products?.price || price
            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
            const quantity = item.quantity || 1
            const image = item.image_url || item.products?.image_url || item.products?.images?.[0]?.url || '/placeholder-product.svg'
            return (
              <div key={item.id || item.product_id} className="cart-item">
                <div className="cart-item-left">
                  <div className="cart-thumb">
                    <Image src={image} alt={item.name || item.products?.name || 'Product'} fill sizes="120px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="cart-info">
                    <Link href={`/products/${item.slug || item.products?.slug || item.product_id}`} className="cart-title">
                      {item.name || item.products?.name || 'Product'}
                    </Link>
                    <div className="cart-meta">In stock</div>
                    {discount > 0 && <div className="cart-badge">-{discount}%</div>}
                    <button
                      className="link-btn"
                      onClick={() => handleRemove(item.product_id || item.products?.id)}
                      disabled={updatingId === (item.product_id || item.products?.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div className="price-block">
                    <div className="price">₹{(price).toLocaleString()}</div>
                    {mrp > price && <div className="mrp">₹{mrp.toLocaleString()}</div>}
                  </div>
                  <div className="qty-block">
                    <button className="qty-btn" onClick={() => handleUpdateQty(item.product_id || item.products?.id, quantity - 1)} disabled={quantity <= 1 || updatingId === (item.product_id || item.products?.id)}>-</button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => handleUpdateQty(item.product_id || item.products?.id, Number(e.target.value))}
                      disabled={updatingId === (item.product_id || item.products?.id)}
                    />
                    <button className="qty-btn" onClick={() => handleUpdateQty(item.product_id || item.products?.id, quantity + 1)} disabled={updatingId === (item.product_id || item.products?.id)}>+</button>
                  </div>
                  <div className="line-total">₹{(price * quantity).toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString()}</span></div>
          {totals.discount > 0 && <div className="summary-row"><span>Discount</span><span className="green">-₹{totals.discount.toLocaleString()}</span></div>}
          <div className="summary-row"><span>Tax (5%)</span><span>₹{totals.tax.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping.toLocaleString()}`}</span></div>
          <div className="summary-total"><span>Total</span><span>₹{totals.total.toLocaleString()}</span></div>
          <button className="checkout-btn">Checkout</button>
          <p className="summary-note">Free shipping on orders above ₹500.</p>
        </div>
      </div>
      {error && <div className="cart-error">{error}</div>}

      <style jsx>{`
        .cart-page { padding: 20px 0; }
        .cart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .cart-list { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .cart-item { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; border: 1px solid #f0f0f0; border-radius: 12px; padding: 12px; }
        .cart-item-left { display: flex; gap: 12px; }
        .cart-thumb { position: relative; width: 110px; height: 110px; border-radius: 10px; overflow: hidden; background: #f8f8f8; }
        .cart-info { display: flex; flex-direction: column; gap: 6px; }
        .cart-title { font-weight: 700; color: #111; text-decoration: none; }
        .cart-title:hover { color: #007bff; }
        .cart-meta { color: #666; font-size: 13px; }
        .cart-badge { background: #e6f4ea; color: #1c7c3c; padding: 4px 8px; border-radius: 8px; font-size: 12px; display: inline-block; }
        .link-btn { background: none; border: none; color: #d00; cursor: pointer; padding: 0; font-weight: 600; text-align: left; }
        .link-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cart-item-right { display: grid; grid-template-columns: repeat(3, auto); align-items: center; gap: 12px; justify-content: flex-end; }
        .price-block { display: flex; flex-direction: column; align-items: flex-end; }
        .price { font-weight: 700; font-size: 16px; }
        .mrp { text-decoration: line-through; color: #888; font-size: 13px; }
        .qty-block { display: flex; align-items: center; gap: 6px; }
        .qty-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #ddd; background: #fff; cursor: pointer; }
        .qty-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .qty-block input { width: 60px; text-align: center; padding: 6px; border: 1px solid #ddd; border-radius: 8px; }
        .line-total { font-weight: 700; }
        .cart-summary { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 16px; position: sticky; top: 80px; height: fit-content; }
        .cart-summary h3 { margin: 0 0 12px; font-size: 18px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; color: #555; }
        .summary-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; }
        .checkout-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #007bff, #0056b3); color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; margin-top: 12px; }
        .checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .summary-note { color: #777; font-size: 13px; margin-top: 8px; }
        .cart-error { margin-top: 12px; padding: 12px; background: #fee; color: #a00; border: 1px solid #fbb; border-radius: 8px; }
        .cart-state { padding: 40px 0; text-align: center; color: #666; }
        @media (max-width: 900px) { .cart-grid { grid-template-columns: 1fr; } .cart-item { grid-template-columns: 1fr; } .cart-item-right { grid-template-columns: 1fr; justify-items: flex-start; } }
      `}</style>
    </div>
  )
}
