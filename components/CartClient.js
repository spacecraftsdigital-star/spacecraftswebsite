"use client"
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function CartClient() {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState({ subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [userId, setUserId] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  
  // Address states
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [pincodeValidation, setPincodeValidation] = useState(null)
  const [validatingPincode, setValidatingPincode] = useState(false)
  const [showDeliveryRequest, setShowDeliveryRequest] = useState(false)
  const [deliveryRequestData, setDeliveryRequestData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  })

  const fetchCart = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user || null
      setSessionToken(session?.access_token || null)
      setUserId(user?.id || null)

      if (!session) {
        // guest cart from localStorage
        const ls = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
        const guestItems = ls ? JSON.parse(ls) : []
        setItems(guestItems)
        const guestSubtotal = guestItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0)
        setSummary({ subtotal: guestSubtotal, discount: 0, tax: 0, shipping: 0, total: guestSubtotal })
      } else {
        const res = await authenticatedFetch('/api/cart/get')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load cart')
        setItems(data.items || [])
        setSummary(data.summary || { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 })
        
        // Fetch related products if cart has items
        if (data.items && data.items.length > 0) {
          fetchRelatedProducts(data.items[0])
        }
      }
    } catch (err) {
      console.error('Cart fetch error', err)
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (firstItem) => {
    try {
      setRelatedLoading(true)
      console.log('Fetching related products for:', firstItem)
      
      // Get category_id from the first item in cart (flattened structure)
      const categoryId = firstItem.category_id || firstItem.products?.category_id
      const productId = firstItem.product_id || firstItem.products?.id
      
      console.log('Category ID:', categoryId, 'Product ID:', productId)
      
      if (categoryId && productId) {
        const url = `/api/products/related?category_id=${categoryId}&product_id=${productId}&limit=4`
        console.log('Fetching from:', url)
        
        const res = await fetch(url)
        const data = await res.json()
        
        console.log('Related products response:', data)
        
        if (res.ok && data.items) {
          setRelatedProducts(data.items)
          console.log('Set related products:', data.items.length, 'items')
        } else {
          console.log('Failed to get related products:', data)
        }
      } else {
        console.log('Missing category_id or product_id')
      }
    } catch (err) {
      console.error('Error fetching related products:', err)
    } finally {
      setRelatedLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    if (sessionToken) {
      fetchAddresses()
    }
  }, [sessionToken])

  const fetchAddresses = async () => {
    try {
      const res = await authenticatedFetch('/api/addresses')
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
        // Auto-select default address
        const defaultAddr = data.addresses?.find(a => a.is_default)
        if (defaultAddr) {
          setSelectedAddress(defaultAddr)
          validatePincode(defaultAddr.postal_code)
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
    }
  }

  const validatePincode = async (postal_code) => {
    if (!postal_code || postal_code.length !== 6) return
    
    setValidatingPincode(true)
    try {
      const res = await fetch(`/api/validate-pincode?postal_code=${postal_code}`)
      const data = await res.json()
      
      if (res.ok) {
        setPincodeValidation(data)
        
        // Update shipping cost based on validation
        if (data.available && data.deliveryInfo?.shippingCharge !== undefined) {
          setSummary(prev => ({
            ...prev,
            shipping: data.deliveryInfo.shippingCharge,
            total: prev.subtotal - prev.discount + prev.tax + data.deliveryInfo.shippingCharge
          }))
        } else if (!data.available) {
          // No delivery available - set shipping to 0
          setSummary(prev => ({
            ...prev,
            shipping: 0,
            total: prev.subtotal - prev.discount + prev.tax
          }))
        }
      }
    } catch (err) {
      console.error('Pincode validation error:', err)
    } finally {
      setValidatingPincode(false)
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    validatePincode(address.postal_code)
    setShowAddressForm(false)
  }

  const handleDeliveryRequest = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/validate-pincode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`
        },
        body: JSON.stringify(deliveryRequestData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(data.message)
        setShowDeliveryRequest(false)
        setDeliveryRequestData({
          full_name: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          postal_code: ''
        })
      } else {
        alert(data.error || 'Failed to submit request')
      }
    } catch (err) {
      console.error('Delivery request error:', err)
      alert('Failed to submit delivery request')
    }
  }

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
      const res = await authenticatedFetch('/api/cart/update', {
        method: 'PUT',
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
      const res = await authenticatedFetch(`/api/cart/remove?product_id=${product_id}`, {
        method: 'DELETE'
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    if (!userId) {
      setCouponError('Please login to apply coupon')
      return
    }

    setApplyingCoupon(true)
    setCouponError(null)

    try {
      const res = await authenticatedFetch('/api/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({
          coupon_code: couponCode,
          user_id: userId
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code')
        setAppliedCoupon(null)
      } else {
        setAppliedCoupon(data)
        setCouponError(null)
        // Recalculate totals with coupon discount
        const couponDiscount = (totals.subtotal * data.discount_percentage) / 100
        const newTotal = totals.subtotal - couponDiscount + totals.tax + totals.shipping
        setSummary({
          ...totals,
          discount: couponDiscount,
          total: newTotal
        })
      }
    } catch (err) {
      console.error('Coupon error:', err)
      setCouponError('Failed to apply coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
    // Recalculate totals without coupon
    const newTotal = totals.subtotal + totals.tax + totals.shipping
    setSummary({
      ...totals,
      discount: 0,
      total: newTotal
    })
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
          {totals.discount > 0 && <div className="summary-row discount-row"><span>Coupon Discount ({appliedCoupon?.discount_percentage}%)</span><span className="green">-₹{totals.discount.toLocaleString()}</span></div>}
          <div className="summary-row"><span>Tax (5%)</span><span>₹{totals.tax.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping.toLocaleString()}`}</span></div>
          <div className="summary-total"><span>Total</span><span>₹{totals.total.toLocaleString()}</span></div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <div className="coupon-title">Have a coupon?</div>
            {!appliedCoupon ? (
              <div className="coupon-input-group">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={applyingCoupon}
                />
                <button 
                  className="apply-coupon-btn" 
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                >
                  {applyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="applied-coupon">
                <div className="coupon-success">
                  ✓ {appliedCoupon.coupon_code} applied ({appliedCoupon.discount_percentage}% off)
                </div>
                <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>Remove</button>
              </div>
            )}
            {couponError && <div className="coupon-error">{couponError}</div>}
          </div>

          {/* Address Selection Section */}
          {sessionToken && (
            <div className="address-section">
              <div className="address-header">
                <h4>Delivery Address</h4>
                {addresses.length > 0 && !showAddressForm && (
                  <button className="change-address-btn" onClick={() => setShowAddressForm(!showAddressForm)}>
                    {showAddressForm ? 'Cancel' : 'Change'}
                  </button>
                )}
              </div>

              {!showAddressForm && selectedAddress ? (
                <div className="selected-address">
                  <div className="address-name">{selectedAddress.full_name}</div>
                  <div className="address-details">
                    {selectedAddress.address_line1}, {selectedAddress.address_line2}
                    <br />
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                  </div>
                  <div className="address-phone">Phone: {selectedAddress.phone}</div>
                  
                  {validatingPincode && <div className="validating">Validating pincode...</div>}
                  
                  {pincodeValidation && !validatingPincode && (
                    <div className={`pincode-status ${pincodeValidation.available ? 'available' : 'unavailable'}`}>
                      {pincodeValidation.available ? (
                        <>
                          ✓ Delivery available
                          {pincodeValidation.deliveryInfo && (
                            <span className="delivery-info">
                              ({pincodeValidation.deliveryInfo.deliveryDays} days, 
                              ₹{pincodeValidation.deliveryInfo.shippingCharge} shipping)
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          ⚠ Delivery not available
                          {!showDeliveryRequest && (
                            <button 
                              className="request-delivery-btn"
                              onClick={() => {
                                setShowDeliveryRequest(true)
                                setDeliveryRequestData({
                                  full_name: selectedAddress.full_name,
                                  phone: selectedAddress.phone,
                                  address: `${selectedAddress.address_line1}, ${selectedAddress.address_line2 || ''}`,
                                  city: selectedAddress.city,
                                  state: selectedAddress.state,
                                  postal_code: selectedAddress.postal_code
                                })
                              }}
                            >
                              Request Delivery
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : showAddressForm && addresses.length > 0 ? (
                <div className="address-list">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                      onClick={() => handleAddressSelect(addr)}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => {}}
                      />
                      <div className="address-option-content">
                        <div className="address-option-name">{addr.full_name}</div>
                        <div className="address-option-details">
                          {addr.address_line1}, {addr.city} - {addr.postal_code}
                        </div>
                      </div>
                    </div>
                  ))}
                  <a href="/account" className="add-new-address-link">+ Add New Address</a>
                </div>
              ) : (
                <div className="no-address">
                  <p>No delivery address found</p>
                  <a href="/account" className="add-address-link">Add Address</a>
                </div>
              )}

              {/* Delivery Request Form */}
              {showDeliveryRequest && (
                <div className="delivery-request-form">
                  <h4>Request Delivery to Your Area</h4>
                  <p className="request-note">We'll contact you with shipping details</p>
                  <form onSubmit={handleDeliveryRequest}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={deliveryRequestData.full_name}
                      onChange={e => setDeliveryRequestData({...deliveryRequestData, full_name: e.target.value})}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={deliveryRequestData.phone}
                      onChange={e => setDeliveryRequestData({...deliveryRequestData, phone: e.target.value})}
                      pattern="[0-9]{10}"
                      required
                    />
                    <textarea
                      placeholder="Complete Address"
                      value={deliveryRequestData.address}
                      onChange={e => setDeliveryRequestData({...deliveryRequestData, address: e.target.value})}
                      required
                      rows={3}
                    />
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="City"
                        value={deliveryRequestData.city}
                        onChange={e => setDeliveryRequestData({...deliveryRequestData, city: e.target.value})}
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={deliveryRequestData.state}
                        onChange={e => setDeliveryRequestData({...deliveryRequestData, state: e.target.value})}
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={deliveryRequestData.postal_code}
                      onChange={e => setDeliveryRequestData({...deliveryRequestData, postal_code: e.target.value})}
                      pattern="[0-9]{6}"
                      required
                    />
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={() => setShowDeliveryRequest(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-request-btn">
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          <button 
            className="checkout-btn"
            disabled={sessionToken && (!selectedAddress || (pincodeValidation && !pincodeValidation.available && !showDeliveryRequest))}
          >
            {sessionToken && !selectedAddress ? 'Select Address to Checkout' : 'Proceed to Checkout'}
          </button>
          <p className="summary-note">
            {pincodeValidation && !pincodeValidation.available 
              ? 'Delivery unavailable. Request delivery or contact us.' 
              : 'Free shipping on orders above ₹500.'}
          </p>
        </div>
      </div>
      {error && <div className="cart-error">{error}</div>}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2>You Might Also Like</h2>
          {relatedLoading ? (
            <div className="related-loading">Loading suggestions...</div>
          ) : (
            <div className="related-grid">
              {relatedProducts.map(product => {
                const discount = product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0

                return (
                  <Link key={product.id} href={`/products/${product.slug}`} className="related-card">
                    <div className="related-image">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={280}
                        height={280}
                        style={{ objectFit: 'cover' }}
                      />
                      {discount > 0 && <span className="badge">-{discount}%</span>}
                    </div>
                    <div className="related-info">
                      <h4>{product.name}</h4>
                      <div className="rating">
                        <span className="stars">{'★'.repeat(Math.round(product.rating || 4))}</span>
                        <span className="count">({product.review_count || 0})</span>
                      </div>
                      <div className="price">
                        <span className="current">₹{product.price.toLocaleString()}</span>
                        {discount > 0 && (
                          <span className="original">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <button className="add-btn">Add to Cart</button>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .cart-page { padding: 20px 0; }
        .cart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .cart-list { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .cart-item { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; border: 1px solid #f0f0f0; border-radius: 12px; padding: 12px; }
        .cart-item-left { display: flex; gap: 12px; }
        .cart-thumb { position: relative; width: 110px; height: 110px; border-radius: 10px; overflow: hidden; background: #f8f8f8; flex-shrink: 0; }
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
        .checkout-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #007bff, #0056b3); color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; margin-top: 12px; transition: all 0.3s; }
        .checkout-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .summary-note { color: #777; font-size: 13px; margin-top: 8px; }
        .cart-error { margin-top: 12px; padding: 12px; background: #fee; color: #a00; border: 1px solid #fbb; border-radius: 8px; }
        .cart-state { padding: 40px 0; text-align: center; color: #666; }
        .green { color: #27ae60; font-weight: 600; }
        .discount-row { color: #27ae60; }
        .coupon-section { margin: 16px 0; padding: 16px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
        .coupon-title { font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #333; }
        .coupon-input-group { display: flex; gap: 8px; }
        .coupon-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
        .coupon-input:focus { outline: none; border-color: #007bff; }
        .apply-coupon-btn { padding: 10px 20px; background: #007bff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; white-space: nowrap; }
        .apply-coupon-btn:hover { background: #0056b3; }
        .apply-coupon-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .applied-coupon { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .coupon-success { background: #d4edda; color: #155724; padding: 10px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; flex: 1; }
        .remove-coupon-btn { padding: 8px 16px; background: #dc3545; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; white-space: nowrap; }
        .remove-coupon-btn:hover { background: #c82333; }
        .coupon-error { margin-top: 8px; color: #dc3545; font-size: 13px; background: #f8d7da; padding: 8px; border-radius: 6px; }
        
        .related-section { margin-top: 48px; padding: 32px 0; border-top: 2px solid #f0f0f0; }
        .related-section h2 { font-size: 24px; margin-bottom: 24px; }
        .related-loading { text-align: center; padding: 20px; color: #666; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .related-card { text-decoration: none; color: inherit; transition: all 0.3s; border-radius: 12px; overflow: hidden; }
        .related-card:hover { transform: translateY(-4px); }
        .related-image { position: relative; width: 100%; aspect-ratio: 1; background: #f8f8f8; border-radius: 12px; overflow: hidden; }
        .related-image img { width: 100%; height: 100%; object-fit: cover; }
        .badge { position: absolute; top: 12px; right: 12px; background: #e74c3c; color: #fff; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 13px; }
        .related-info { padding: 12px 0; }
        .related-info h4 { margin: 0 0 8px; font-size: 15px; font-weight: 700; }
        .rating { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-size: 13px; }
        .stars { color: #ffc107; }
        .count { color: #999; }
        .related-info .price { display: flex; gap: 8px; margin-bottom: 12px; font-weight: 700; }
        .related-info .current { color: #111; font-size: 16px; }
        .related-info .original { text-decoration: line-through; color: #999; font-size: 14px; }
        .add-btn { width: 100%; padding: 10px; background: linear-gradient(135deg, #007bff, #0056b3); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .add-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        
        @media (max-width: 900px) { 
          .cart-grid { grid-template-columns: 1fr; } 
          .cart-item { grid-template-columns: 1fr; } 
          .cart-item-right { grid-template-columns: 1fr; justify-items: flex-start; }
          .related-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }
      `}</style>
    </div>
  )
}
