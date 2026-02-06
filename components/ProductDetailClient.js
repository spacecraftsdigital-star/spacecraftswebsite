'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ReviewForm from './ReviewForm'
import ReviewsList from './ReviewsList'
import ProductQA from './ProductQA'
import RazorpayPayment from './RazorpayPayment'
import { supabase } from '../lib/supabaseClient'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function ProductDetailClient({ 
  product, 
  images, 
  category, 
  brand, 
  variants, 
  offers, 
  warranties, 
  emiOptions, 
  stores, 
  specifications,
  relatedProducts, 
  reviews 
}) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [expandedStore, setExpandedStore] = useState(0)
  const [reviewStats, setReviewStats] = useState({
    avg: product.rating || 0,
    count: product.review_count || 0
  })
  const [reviewsRefresh, setReviewsRefresh] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [deliveryChecking, setDeliveryChecking] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [deliveryRequest, setDeliveryRequest] = useState({ pincode: '', contact: '', email: '' })
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState(null)
  const [cartSuccess, setCartSuccess] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  console.log('ProductDetailClient Debug:', { product: product.name, productId: product.id, imagesCount: images?.length, images })

  const displayPrice = product.discount_price || product.price
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const mainImage = imageError 
    ? '/placeholder-product.svg'
    : (images[selectedImage]?.url || '/placeholder-product.svg')

  console.log('Main Image Debug:', { 
    imageError, 
    selectedImage, 
    mainImage,
    imageObject: images[selectedImage],
    imagesArray: images 
  })

  const handleAddToCart = async () => {
    setCartError(null)
    setCartSuccess(null)
    setCartLoading(true)

    try {
      // Validate quantity
      if (!quantity || quantity < 1) {
        setCartError('Please select a valid quantity')
        setCartLoading(false)
        return
      }

      // Check stock availability
      if (product.stock && quantity > product.stock) {
        setCartError(`Only ${product.stock} items available in stock`)
        setCartLoading(false)
        return
      }

      console.log('Getting session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setCartError('Session error. Please try logging in again.')
        setCartLoading(false)
        return
      }

      if (!session?.access_token) {
        console.log('No session found')
        setCartError('Please login to add items to cart')
        setCartLoading(false)
        return
      }

      console.log('Making API call with token:', session.access_token.substring(0, 20) + '...')
      const response = await authenticatedFetch('/api/cart/add', {
        method: 'POST',
        body: JSON.stringify({ 
          product_id: product.id, 
          quantity: parseInt(quantity) 
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        setCartError(data.error || 'Failed to add item to cart')
        setCartLoading(false)
        return
      }

      setCartSuccess(`${data.cartItem.product_name} added to cart! (${data.cartItem.quantity} ${data.cartItem.quantity > 1 ? 'items' : 'item'})`)
      
      // Reset quantity to 1 after successful add
      setTimeout(() => {
        setQuantity(1)
        setCartSuccess(null)
      }, 3000)

    } catch (error) {
      console.error('Error adding to cart:', error)
      setCartError('An error occurred while adding to cart. Please try again.')
      setCartLoading(false)
    } finally {
      setCartLoading(false)
    }
  }

  const handleAddToWishlist = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        alert('Session error. Please try logging in again.')
        return
      }

      if (!session?.access_token) {
        alert('Please login to add items to wishlist')
        return
      }

      const response = await authenticatedFetch('/api/wishlist/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(data.message || 'Added to wishlist!')
      } else {
        alert(data.error || 'Failed to add to wishlist')
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleBuyNow = async () => {
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.access_token) {
      alert('Please login to proceed with payment')
      router.push('/login')
      return
    }

    // Open Razorpay payment modal for direct purchase
    setIsPaymentModalOpen(true)
  }

  // Navigation handlers for image gallery
  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setImageError(false)
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setImageError(false)
  }

  // Zoom handlers
  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Pincode Delivery Checker
  const checkDelivery = async (pinCode) => {
    if (!pinCode || pinCode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }
    
    setDeliveryChecking(true)
    
    try {
      const response = await fetch('/api/check-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pinCode })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Error checking delivery')
        setDeliveryChecking(false)
        return
      }

      if (data.available) {
        setDeliveryInfo({
          available: true,
          place: data.place,
          freeShipping: data.freeShipping,
          shippingCost: data.shippingCost,
          deliveryDays: data.deliveryDays,
          estimatedDate: data.estimatedDate,
          city: data.city,
          state: data.state,
          codAvailable: data.codAvailable
        })
        setShowRequestForm(false)
      } else {
        setDeliveryInfo({
          available: false,
          place: 'Delivery area not available',
          message: data.message || 'We don\'t deliver to this pincode yet'
        })
        setShowRequestForm(true)
      }
    } catch (error) {
      console.error('Error checking delivery:', error)
      alert('Failed to check delivery. Please try again.')
    } finally {
      setDeliveryChecking(false)
    }
  }

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // In real app, reverse geocode to get pincode
        alert(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\nEnter your pincode for delivery check`)
      },
      (error) => {
        alert('Unable to access location. Please enable location services.')
        console.error('Geolocation error:', error)
      }
    )
  }

  const submitDeliveryRequest = async () => {
    if (!deliveryRequest.pincode || !deliveryRequest.contact || !deliveryRequest.email) {
      alert('Please fill all required fields')
      return
    }

    if (deliveryRequest.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    try {
      const response = await fetch('/api/delivery-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          pincode: deliveryRequest.pincode,
          contact: deliveryRequest.contact,
          email: deliveryRequest.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to submit request. Please try again.')
        return
      }

      alert('Thank you! We\'ll notify you when delivery is available in your area.')
      setDeliveryRequest({ pincode: '', contact: '', email: '' })
      setShowRequestForm(false)
      setDeliveryInfo(null)
    } catch (error) {
      console.error('Error submitting delivery request:', error)
      alert('Failed to submit request. Please try again.')
    }
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              {category && (
                <li className="breadcrumb-item">
                  <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
                </li>
              )}
              <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Main Product Section */}
        <div className="product-main">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image-container">
              <div 
                className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <Image 
                  src={mainImage}
                  alt={product.name}
                  width={700}
                  height={700}
                  style={{ 
                    objectFit: 'cover', 
                    width: '100%', 
                    height: 'auto',
                    transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : 'center',
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transition: isZoomed ? 'none' : 'transform 0.3s ease'
                  }}
                  priority
                  onError={() => {
                    console.error('Main image failed to load:', { url: mainImage })
                    setImageError(true)
                  }}
                />
                {discountPercentage > 0 && (
                  <span className="discount-badge">-{discountPercentage}%</span>
                )}
                {!isZoomed && (
                  <div className="zoom-hint">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                    Hover to zoom
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <>
                  <button className="nav-arrow prev-arrow" onClick={handlePrevImage} aria-label="Previous image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button className="nav-arrow next-arrow" onClick={handleNextImage} aria-label="Next image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedImage(index)
                      setImageError(false)
                    }}
                  >
                    <Image 
                      src={img.url}
                      alt={img.alt || `${product.name} view ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                      onError={() => setImageError(true)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            {brand && (
              <div className="product-brand">
                <Link href={`/products?brand=${brand.slug}`}>{brand.name}</Link>
              </div>
            )}
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.round(reviewStats.avg))}{'☆'.repeat(5 - Math.round(reviewStats.avg))}
              </div>
              <span className="rating-text">
                {reviewStats.avg?.toFixed?.(1) || '0.0'} ({reviewStats.count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="product-price">
              <span className="current-price">₹{displayPrice.toLocaleString('en-IN')}</span>
              {product.discount_price && (
                <>
                  <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="save-text">You save ₹{(product.price - product.discount_price).toLocaleString('en-IN')}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.5 5.5l-4 4-2-2"/>
                  </svg>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            <p className="short-description">
              {product.description?.substring(0, 200)}...
            </p>

            {/* Key Features */}
            <div className="key-features">
              {product.material && (
                <div className="feature">
                  <strong>Material:</strong> {product.material}
                </div>
              )}
              {product.warranty && (
                <div className="feature">
                  <strong>Warranty:</strong> {product.warranty}
                </div>
              )}
              {product.delivery_info && (
                <div className="feature">
                  <strong>Delivery:</strong> {product.delivery_info}
                </div>
              )}
            </div>

            {/* Color Variants Section */}
            {variants && variants.length > 0 ? (
              <div className="variants-section">
                <h4>Select Colour</h4>
                <div className="variants-grid">
                  {variants.map((variant, idx) => (
                    <div 
                      key={variant.id}
                      className={`variant-card ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.image_url && (
                        <div className="variant-image">
                          <Image 
                            src={variant.image_url} 
                            alt={variant.variant_name}
                            width={80}
                            height={80}
                            onError={() => {}}
                          />
                        </div>
                      )}
                      <span className="variant-name">{variant.variant_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: '8px', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                ℹ️ No color variants added yet. Variants will appear here once added to the database.
              </div>
            )}

            {/* Limited Stock Warning */}
            {product.is_limited_stock && (
              <div className="limited-stock-alert">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">Hurry! Only {product.stock_quantity || product.stock} Left</span>
              </div>
            )}

            {/* People Viewing & Assurance */}
            <div className="product-assurance">
              <div className="assurance-badge">
                <span className="badge-icon">✓</span>
                <span>100% Authentic</span>
              </div>
              <div className="assurance-badge">
                <span className="badge-icon">🛡️</span>
                <span>Safe & Secure</span>
              </div>
              <div className="assurance-badge">
                <span className="badge-icon">🚚</span>
                <span>Fast Delivery</span>
              </div>
              {product.people_viewing > 0 && (
                <div className="people-viewing">
                  <span className="icon">👥</span>
                  <span>{product.people_viewing} viewing now</span>
                </div>
              )}
            </div>

            {/* Additional Offers Section */}
            {offers && offers.length > 0 ? (
              <div className="offers-section">
                <h4>Additional Offers</h4>
                <ul className="offers-list">
                  {offers.slice(0, 6).map((offer, idx) => (
                    <li key={offer.id} className="offer-item">
                      <span className="offer-icon">🎁</span>
                      <span className="offer-text">
                        {offer.title}
                        {offer.promo_code && <span className="promo-code">{offer.promo_code}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#fff3f0', borderRadius: '8px', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                ℹ️ No special offers available. Check back soon for exciting deals!
              </div>
            )}

            {/* EMI Section */}
            {product.emi_enabled && emiOptions && emiOptions.length > 0 ? (
              <div className="emi-section">
                <h4>EMI Options</h4>
                <div className="emi-cards">
                  {emiOptions.slice(0, 3).map((emi) => (
                    <div key={emi.id} className="emi-card">
                      <div className="bank-name">{emi.bank_name}</div>
                      <div className="emi-amount">₹{emi.emi_monthly?.toLocaleString('en-IN')}/mo</div>
                      <div className="emi-tenure">{emi.tenure_months} months</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : product.emi_enabled ? (
              <div style={{ padding: '16px', background: '#f0f7ff', borderRadius: '8px', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                ℹ️ EMI options not yet configured. Contact support for details.
              </div>
            ) : null}

            {/* Protection Plan */}
            {warranties && warranties.length > 0 ? (
              <div className="protection-plan-section">
                <h4>Protect Your Furniture</h4>
                <div className="warranty-cards">
                  {warranties.map((warranty) => (
                    <div 
                      key={warranty.id}
                      className={`warranty-card ${selectedWarranty?.id === warranty.id ? 'selected' : ''}`}
                      onClick={() => setSelectedWarranty(warranty)}
                    >
                      <input 
                        type="radio" 
                        name="warranty"
                        checked={selectedWarranty?.id === warranty.id}
                        onChange={() => setSelectedWarranty(warranty)}
                      />
                      <div className="warranty-info">
                        <span className="warranty-name">{warranty.warranty_name}</span>
                        <span className="warranty-price">₹{warranty.price?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedWarranty && (
                  <div className="warranty-summary">
                    <p className="warranty-description">{selectedWarranty.description}</p>
                    <div className="warranty-cost-breakdown">
                      <div className="cost-row">
                        <span className="cost-label">Product Price:</span>
                        <span className="cost-value">₹{(product.discount_price || product.price)?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="cost-row">
                        <span className="cost-label">Protection Plan:</span>
                        <span className="cost-value">₹{selectedWarranty.price?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="cost-row total">
                        <span className="cost-label">Total Cost:</span>
                        <span className="cost-value total-price">₹{((product.discount_price || product.price) + selectedWarranty.price)?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#fff3e0', borderRadius: '8px', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                ℹ️ Protection plans available on premium models. Standard warranty included.
              </div>
            )}

            {/* Delivery Checker Section */}
            <div className="delivery-checker-section">
              <h4>📦 Check Delivery Availability</h4>
              
              <div className="pincode-input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    className="pincode-input"
                  />
                  <button
                    onClick={() => checkDelivery(pincode)}
                    disabled={deliveryChecking || pincode.length !== 6}
                    className="check-delivery-btn"
                  >
                    {deliveryChecking ? 'Checking...' : 'Check'}
                  </button>
                </div>
                
                <button
                  onClick={getGeolocation}
                  className="locate-btn"
                  title="Use your device location"
                >
                  📍 Use My Location
                </button>
              </div>

              {/* Delivery Available */}
              {deliveryInfo?.available && (
                <div className="delivery-result success">
                  <div className="result-header">
                    <span className="status-icon">✓</span>
                    <h5>Delivery Available!</h5>
                  </div>
                  <div className="delivery-details">
                    <div className="detail-row">
                      <span className="detail-label">📍 Location:</span>
                      <span className="detail-value">{deliveryInfo.place}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🚚 Shipping:</span>
                      <span className="detail-value">
                        {deliveryInfo.freeShipping ? (
                          <span className="free-shipping">FREE</span>
                        ) : (
                          `₹${deliveryInfo.shippingCost}`
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📅 Delivery:</span>
                      <span className="detail-value">{deliveryInfo.deliveryDays} days ({deliveryInfo.estimatedDate})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Not Available */}
              {deliveryInfo?.available === false && !showRequestForm && (
                <div className="delivery-result unavailable">
                  <div className="result-header">
                    <span className="status-icon">⚠</span>
                    <h5>Not Available in Your Area</h5>
                  </div>
                  <p className="unavailable-message">{deliveryInfo.message}</p>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="request-delivery-btn"
                  >
                    Request Delivery to This Area
                  </button>
                </div>
              )}

              {/* Delivery Request Form */}
              {showRequestForm && (
                <div className="delivery-request-form">
                  <h5>Schedule Delivery Request</h5>
                  <p className="form-subtitle">We'll notify you when delivery becomes available in your area</p>
                  
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      value={deliveryRequest.pincode}
                      onChange={(e) => setDeliveryRequest({ ...deliveryRequest, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={deliveryRequest.contact}
                      onChange={(e) => setDeliveryRequest({ ...deliveryRequest, contact: e.target.value })}
                      placeholder="Your contact number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={deliveryRequest.email}
                      onChange={(e) => setDeliveryRequest({ ...deliveryRequest, email: e.target.value })}
                      placeholder="your@email.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={submitDeliveryRequest}
                      className="submit-request-btn"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => {
                        setShowRequestForm(false)
                        setDeliveryInfo(null)
                      }}
                      className="cancel-request-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Delivery & Stores Section */}
            {stores && stores.length > 0 ? (
              <div className="delivery-stores-section">
                <h4>Delivery & Stores Near You</h4>
                <div className="stores-list">
                  {stores.slice(0, 3).map((store, idx) => (
                    <div 
                      key={store.id} 
                      className={`store-card ${expandedStore === idx ? 'expanded' : ''}`}
                    >
                      <div 
                        className="store-header"
                        onClick={() => setExpandedStore(expandedStore === idx ? -1 : idx)}
                      >
                        <div className="store-info">
                          <span className="store-name">{store.store_name}</span>
                          <span className="store-distance">📍 {store.distance_km} km</span>
                        </div>
                        <span className="store-delivery">Delivery in {store.delivery_days} days</span>
                      </div>
                      {expandedStore === idx && (
                        <div className="store-details">
                          <p className="store-address">{store.address}</p>
                          {store.phone && (
                            <div className="store-phone">
                              <span>Call Now:</span>
                              <a href={`tel:${store.phone}`}>{store.phone}</a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', background: '#f3f8f4', borderRadius: '8px', marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                ℹ️ Store information will be displayed here. Check delivery options at checkout.
              </div>
            )}

            {/* Status Messages */}
            {cartError && (
              <div className="cart-message error-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {cartError}
              </div>
            )}
            {cartSuccess && (
              <div className="cart-message success-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {cartSuccess}
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {product.stock > 0 ? (
                <>
                  <button 
                    className="btn-primary btn-large" 
                    onClick={handleBuyNow}
                    disabled={cartLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1h14l2 13H1L3 1zm0 0l1 6m11-6l-1 6"/>
                    </svg>
                    Buy Now
                  </button>
                  <button 
                    className="btn-secondary btn-large" 
                    onClick={handleAddToCart}
                    disabled={cartLoading || quantity < 1}
                  >
                    {cartLoading ? (
                      <>
                        <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" opacity="0.3"/>
                          <path d="M12 2C6.48 2 2 6.48 2 12" strokeLinecap="round"/>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1h14l2 13H1L3 1z"/>
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button className="btn-disabled btn-large" disabled>
                  Out of Stock
                </button>
              )}
              <button className="btn-outline btn-icon" onClick={handleAddToWishlist}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 18l-1.5-1.5C4 12 1 9 1 5.5 1 3.5 2.5 2 4.5 2c1.5 0 3 1 3.5 2.5C8.5 3 10 2 11.5 2c2 0 3.5 1.5 3.5 3.5 0 3.5-3 6.5-7.5 11L10 18z"/>
                </svg>
              </button>
            </div>

            {/* Additional Info Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <strong>Tags:</strong>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <Link 
                      key={index} 
                      href={`/products?q=${tag}`}
                      className="tag"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button 
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={activeTab === 'specifications' ? 'active' : ''}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={activeTab === 'warranty' ? 'active' : ''}
              onClick={() => setActiveTab('warranty')}
            >
              Warranty
            </button>
            <button 
              className={activeTab === 'care' ? 'active' : ''}
              onClick={() => setActiveTab('care')}
            >
              Care & Maintenance
            </button>
            <button 
              className={activeTab === 'brand' ? 'active' : ''}
              onClick={() => setActiveTab('brand')}
            >
              Brand & Collection
            </button>
            <button 
              className={activeTab === 'stores' ? 'active' : ''}
              onClick={() => setActiveTab('stores')}
            >
              Stores Near You
            </button>
            <button 
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button 
              className={activeTab === 'qa' ? 'active' : ''}
              onClick={() => setActiveTab('qa')}
            >
              Q&A
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <h3>Product Description</h3>
                {product.description && (
                  <ul className="description-list">
                    {product.description
                      .split(/[.!?]+/)
                      .filter(sentence => sentence.trim().length > 10)
                      .map((sentence, index) => (
                        <li key={index}>{sentence.trim()}</li>
                      ))
                    }
                  </ul>
                )}
                {product.material && (
                  <>
                    <h4>Material & Build Quality</h4>
                    <p>{product.material}</p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-pane">
                <h3>Technical Specifications</h3>
                {specifications && specifications.length > 0 ? (
                  <div className="specifications-container">
                    {/* Group specifications by category */}
                    {Object.entries(
                      specifications.reduce((acc, spec) => {
                        if (!acc[spec.spec_category]) {
                          acc[spec.spec_category] = []
                        }
                        acc[spec.spec_category].push(spec)
                        return acc
                      }, {})
                    ).map(([category, specs]) => (
                      <div key={category} className="spec-category">
                        <h4>{category}</h4>
                        <table className="specs-table">
                          <tbody>
                            {specs.map((spec) => (
                              <tr key={spec.id}>
                                <td><strong>{spec.spec_name}</strong></td>
                                <td>{spec.spec_value} {spec.unit ? spec.unit : ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="specs-table">
                    <tbody>
                      {/* Dimensions Section */}
                      <tr>
                        <td colSpan="2" style={{ fontWeight: 'bold', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>Dimensions</td>
                      </tr>
                      <tr>
                        <td><strong>Length</strong></td>
                        <td>180 cm</td>
                      </tr>
                      <tr>
                        <td><strong>Width</strong></td>
                        <td>90 cm</td>
                      </tr>
                      <tr>
                        <td><strong>Height</strong></td>
                        <td>85 cm</td>
                      </tr>
                      <tr>
                        <td><strong>Seating Height</strong></td>
                        <td>42 cm</td>
                      </tr>

                      {/* Material Section */}
                      <tr>
                        <td colSpan="2" style={{ fontWeight: 'bold', background: '#f5f5f5', padding: '8px', marginTop: '10px', borderRadius: '4px' }}>Material & Construction</td>
                      </tr>
                      {product.material && (
                        <tr>
                          <td><strong>Material</strong></td>
                          <td>{product.material}</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>Frame Material</strong></td>
                        <td>Solid Wood</td>
                      </tr>
                      <tr>
                        <td><strong>Cushion Material</strong></td>
                        <td>High Density Foam</td>
                      </tr>

                      {/* Warranty & Other Info */}
                      <tr>
                        <td colSpan="2" style={{ fontWeight: 'bold', background: '#f5f5f5', padding: '8px', marginTop: '10px', borderRadius: '4px' }}>Additional Information</td>
                      </tr>
                      {product.warranty_period && (
                        <tr>
                          <td><strong>Warranty</strong></td>
                          <td>{product.warranty_period} Months</td>
                        </tr>
                      )}
                      {product.return_days && (
                        <tr>
                          <td><strong>Return Period</strong></td>
                          <td>{product.return_days} Days</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>SKU</strong></td>
                        <td>{product.id}</td>
                      </tr>
                      <tr>
                        <td><strong>Stock Quantity</strong></td>
                        <td>{product.stock_quantity || product.stock || 0} units</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="tab-pane warranty-tab">
                <h3>Warranty Information</h3>
                {warranties && warranties.length > 0 ? (
                  <div className="warranty-details">
                    <p><strong>Standard Warranty:</strong> {product.warranty_period || 36} Months</p>
                    <p><strong>Warranty Type:</strong> {product.warranty_type || 'Premium'}</p>
                    <h4>Coverage Details</h4>
                    <ul className="warranty-list">
                      <li>✓ Manufacturing defects covered</li>
                      <li>✓ Material & workmanship guarantee</li>
                      <li>✓ Free repairs during warranty period</li>
                      <li>✓ Parts replacement as per warranty terms</li>
                    </ul>
                    <h4>Extended Protection Plans Available</h4>
                    <div className="warranty-plans">
                      {warranties.map((plan, idx) => (
                        <div key={plan.id} className="plan-card">
                          <h5>{plan.warranty_name}</h5>
                          <p className="plan-price">₹{plan.price?.toLocaleString('en-IN')}</p>
                          <p className="plan-duration">{plan.warranty_months} Months Coverage</p>
                          <p className="plan-description">{plan.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="warranty-details">
                    <p><strong>Standard Warranty:</strong> {product.warranty_period || 36} Months</p>
                    <p><strong>Warranty Type:</strong> {product.warranty_type || 'Premium'}</p>
                    <h4>Coverage Details</h4>
                    <ul className="warranty-list">
                      <li>✓ Manufacturing defects covered</li>
                      <li>✓ Material & workmanship guarantee</li>
                      <li>✓ Free repairs during warranty period</li>
                      <li>✓ Parts replacement as per warranty terms</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'care' && (
              <div className="tab-pane care-tab">
                <h3>Care & Maintenance</h3>
                <div className="care-content">
                  <h4>General Care Instructions</h4>
                  <p>{product.care_instructions || 'Dry clean only. Keep away from direct sunlight. Use soft brush for regular cleaning. Avoid sharp objects.'}</p>
                  
                  <h4>Cleaning Tips</h4>
                  <ul className="care-list">
                    <li><strong>Regular Cleaning:</strong> Use a soft brush or vacuum with upholstery attachment weekly</li>
                    <li><strong>Spot Cleaning:</strong> Blot spills immediately with a soft, dry cloth</li>
                    <li><strong>Deep Cleaning:</strong> Professional dry cleaning recommended once a year</li>
                    <li><strong>Dust Control:</strong> Wipe wooden parts with a soft, damp cloth weekly</li>
                  </ul>

                  <h4>Prevention Tips</h4>
                  <ul className="care-list">
                    <li>Keep away from direct sunlight to prevent fading</li>
                    <li>Maintain room humidity between 40-60%</li>
                    <li>Use protective pads under furniture feet</li>
                    <li>Avoid placing hot items directly on surface</li>
                    <li>Keep away from heat sources and moisture</li>
                  </ul>

                  <h4>Longevity Tips</h4>
                  <ul className="care-list">
                    <li>Rotate cushions regularly for even wear</li>
                    <li>Use furniture covers when not in use</li>
                    <li>Avoid jumping or standing on upholstered furniture</li>
                    <li>Use coasters and placemats to prevent stains</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'brand' && (
              <div className="tab-pane brand-tab">
                <h3>Brand & Collection Overview</h3>
                <div className="brand-content">
                  {brand && (
                    <div className="brand-section">
                      <h4>About {brand.name}</h4>
                      <p>{brand.name} is a leading furniture manufacturer known for quality, durability, and stylish designs. We are committed to providing premium furniture solutions for modern living spaces.</p>
                      
                      <div className="brand-highlights">
                        <div className="highlight-item">
                          <span className="highlight-icon">🏆</span>
                          <span className="highlight-text">Premium Quality Materials</span>
                        </div>
                        <div className="highlight-item">
                          <span className="highlight-icon">🎯</span>
                          <span className="highlight-text">Modern Designs</span>
                        </div>
                        <div className="highlight-item">
                          <span className="highlight-icon">✓</span>
                          <span className="highlight-text">Long-lasting Durability</span>
                        </div>
                        <div className="highlight-item">
                          <span className="highlight-icon">💚</span>
                          <span className="highlight-text">Eco-friendly Production</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {category && (
                    <div className="category-section">
                      <h4>Collection: {category.name}</h4>
                      <p>This product is part of our exclusive {category.name} collection, carefully curated for style and functionality.</p>
                      <Link href={`/category/${category.slug}`} className="view-collection-link">
                        View Full Collection →
                      </Link>
                    </div>
                  )}

                  <div className="collection-benefits">
                    <h4>Why Choose This Collection?</h4>
                    <ul>
                      <li>Handpicked designs for contemporary homes</li>
                      <li>Best-selling products with proven quality</li>
                      <li>Expert craftsmanship and attention to detail</li>
                      <li>Backed by customer reviews and ratings</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stores' && (
              <div className="tab-pane stores-tab">
                <h3>Stores Near You</h3>
                {stores && stores.length > 0 ? (
                  <div className="stores-detailed">
                    <p className="stores-intro">Visit our showrooms to experience the product in person:</p>
                    <div className="stores-grid">
                      {stores.map((store) => (
                        <div key={store.id} className="store-detailed-card">
                          <div className="store-header-detail">
                            <h4>{store.store_name}</h4>
                            <span className="store-distance">📍 {store.distance_km} km away</span>
                          </div>
                          <div className="store-body-detail">
                            <p className="store-address-detail">{store.address}</p>
                            {store.phone && (
                              <p className="store-phone-detail">
                                <strong>Phone:</strong> <a href={`tel:${store.phone}`}>{store.phone}</a>
                              </p>
                            )}
                            <p className="store-delivery-detail">
                              <strong>Delivery:</strong> {store.delivery_days} days
                            </p>
                            <button 
                              className="store-directions-btn"
                              onClick={() => {
                                // Open Google Maps with store location
                                const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(store.address)}`;
                                window.open(mapsUrl, '_blank');
                              }}
                              title="Open directions in Google Maps"
                            >
                              📍 Get Directions
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-stores">
                    <p>Store information will be available soon. Check back later!</p>
                    <Link href="/store-locator" className="store-locator-link">
                      Find All Stores →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane">
                <ReviewForm 
                  productId={product.id} 
                  onReviewSubmitted={() => setReviewsRefresh((n) => n + 1)} 
                />
                <ReviewsList 
                  productId={product.id} 
                  refresh={reviewsRefresh} 
                  onStatsChange={(avg, count) => setReviewStats({ avg, count })}
                />
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="tab-pane">
                <ProductQA productId={product.id} />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="products-grid">
              {relatedProducts.map(relatedProduct => (
                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .product-detail-page {
          background: #f8f9fa;
          min-height: 100vh;
        }

        .breadcrumb-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          padding: 24px 0;
          border-bottom: 1px solid #e9ecef;
          margin-bottom: 32px;
        }

        .breadcrumb {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 4px;
          flex-wrap: wrap;
          align-items: center;
        }

        .breadcrumb-item {
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          animation: slideInBreadcrumb 0.4s ease-out backwards;
        }

        @keyframes slideInBreadcrumb {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .breadcrumb-item:nth-child(1) { animation-delay: 0.05s; }
        .breadcrumb-item:nth-child(2) { animation-delay: 0.1s; }
        .breadcrumb-item:nth-child(3) { animation-delay: 0.15s; }
        .breadcrumb-item:nth-child(4) { animation-delay: 0.2s; }
        .breadcrumb-item:nth-child(5) { animation-delay: 0.25s; }

        .breadcrumb-item a {
          color: #007bff;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          position: relative;
        }

        .breadcrumb-item a::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0) 0%, rgba(0, 123, 255, 0.1) 100%);
          border-radius: 6px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .breadcrumb-item a:hover {
          color: #0056b3;
          background: rgba(0, 123, 255, 0.08);
          transform: translateX(2px);
        }

        .breadcrumb-item a:hover::before {
          opacity: 1;
        }

        .breadcrumb-item.active {
          color: #333;
          font-weight: 600;
        }

        .breadcrumb-item:not(:last-child)::after {
          content: '›';
          margin-left: 8px;
          color: #dee2e6;
          font-weight: 300;
          transition: all 0.3s ease;
        }

        .breadcrumb-item:hover:not(:last-child)::after {
          color: #007bff;
          transform: scaleX(1.2);
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .product-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          background: white;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 40px;
        }

        .product-gallery {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .main-image-container {
          position: relative;
          margin-bottom: 16px;
        }

        .main-image {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #f8f9fa;
          cursor: zoom-in;
        }

        .main-image.zoomed {
          cursor: zoom-out;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 10;
          color: #333;
        }

        .nav-arrow:hover {
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          transform: translateY(-50%) scale(1.1);
        }

        .nav-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }

        .prev-arrow {
          left: 16px;
        }

        .next-arrow {
          right: 16px;
        }

        .zoom-hint {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.75);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .main-image:hover .zoom-hint {
          opacity: 1;
        }

        .main-image.zoomed {
          cursor: zoom-out;
        }

        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 10;
          color: #333;
        }

        .nav-arrow:hover {
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          transform: translateY(-50%) scale(1.1);
        }

        .nav-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }

        .prev-arrow {
          left: 16px;
        }

        .next-arrow {
          right: 16px;
        }

        .zoom-hint {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.75);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .main-image:hover .zoom-hint {
          opacity: 1;
        }

        .discount-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #dc3545;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 700;
        }

        .thumbnail-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .thumbnail {
          border: 2px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: none;
          padding: 0;
          transition: all 0.2s;
        }

        .thumbnail:hover,
        .thumbnail.active {
          border-color: #007bff;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideInRight 0.5s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .product-brand a {
          color: #007bff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .product-brand a:hover {
          color: #0056b3;
        }

        .product-title {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          margin: 0;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
          border-top: 1px solid #e9ecef;
        }

        .stars {
          color: #ffc107;
          font-size: 20px;
          letter-spacing: 2px;
        }

        .rating-text {
          font-size: 14px;
          color: #6c757d;
          font-weight: 500;
        }

        .product-price {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          padding: 8px 0;
        }

        .current-price {
          font-size: 36px;
          font-weight: 700;
          color: #28a745;
        }

        .original-price {
          font-size: 20px;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
        }

        .save-text {
          font-size: 14px;
          color: #dc3545;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(220, 53, 69, 0.1);
          padding: 4px 10px;
          border-radius: 4px;
        }

        .stock-status {
          padding: 12px 16px;
          border-radius: 8px;
          display: inline-block;
        }

        .in-stock {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .out-of-stock {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          color: #721c24;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .short-description {
          padding: 8px 0 0 0;
          animation: slideInUp 0.5s ease-out;
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          border-bottom: none;
          margin: 0;
        }

        .short-description p {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          margin: 0;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .key-features {
          background: white;
          border: none;
          border-radius: 0;
          margin: 4px 0 0 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .feature {
          padding: 8px 0;
          border-radius: 0;
          background: white;
          border: none;
          border-bottom: 1px solid #e9ecef;
          transition: border-color 0.3s ease;
          font-size: 13px;
          line-height: 1.5;
          color: #666;
        }

        .feature:hover {
          transform: none;
          box-shadow: none;
          border-bottom-color: #007bff;
          background: white;
        }

        .feature strong {
          display: block;
          color: #1a1a1a;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          font-weight: 700;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .quantity-selector label {
          font-weight: 600;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-controls button {
          width: 40px;
          height: 40px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          font-size: 20px;
          transition: background 0.2s;
        }

        .quantity-controls button:hover:not(:disabled) {
          background: #e9ecef;
        }

        .quantity-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-controls input {
          width: 60px;
          height: 40px;
          border: none;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
        }

        .cart-message {
          padding: 14px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
          animation: slideDown 0.3s ease-out;
        }

        .error-message {
          background: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .success-message {
          background: #efe;
          color: #3c3;
          border: 1px solid #cfc;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex: 1;
          min-width: 150px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, #1e7e34 0%, #155724 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
        }

        .btn-secondary:disabled,
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-large:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .btn-outline {
          background: white;
          color: #333;
          border: 2px solid #dee2e6;
        }

        .btn-outline:hover {
          border-color: #007bff;
          color: #007bff;
        }

        .btn-icon {
          padding: 16px;
          min-width: auto;
          flex: 0;
        }

        .btn-disabled {
          background: #e9ecef;
          color: #6c757d;
          border: none;
          cursor: not-allowed;
        }

        .product-tags {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tags-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 6px 12px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 13px;
          color: #333;
          text-decoration: none;
          transition: all 0.2s;
        }

        .tag:hover {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .product-tabs {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #f0f0f0;
        }

        .tabs-header {
          display: flex;
          border-bottom: 2px solid #e9ecef;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          overflow-x: auto;
          overflow-y: hidden;
        }

        .tabs-header button {
          flex: 0 0 auto;
          min-width: 140px;
          padding: 14px 16px;
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 2px solid transparent;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          position: relative;
          white-space: nowrap;
        }

        .tabs-header button:hover {
          color: #007bff;
          background: rgba(0, 123, 255, 0.03);
        }

        .tabs-header button.active {
          color: #007bff;
          border-bottom-color: #007bff;
          background: rgba(0, 123, 255, 0.05);
        }

        .tabs-content {
          padding: 28px;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .tab-pane h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 12px;
        }

        .tab-pane h4 {
          font-size: 14px;
          font-weight: 700;
          margin-top: 18px;
          margin-bottom: 12px;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 8px;
          border-bottom: 2px solid #007bff;
          display: inline-block;
        }
        .tab-pane p {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          margin-bottom: 16px;
          text-align: left;
          background: #f8f9fa;
          padding: 14px 16px;
          border-radius: 6px;
          border-left: 3px solid #007bff;
        }

        .description-list {
          list-style: none;
          padding: 0;
          margin: 0 0 18px 0;
        }

        .description-list li {
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          padding: 8px 0 8px 10px;
          position: relative;
          margin-bottom: 10px;
          transition: color 0.3s ease;
        }

        .description-list li:before {
          content: '•';
          position: absolute;
          left: -10px;
          top: 1px;
          color: #007bff;
          font-weight: 700;
          font-size: 18px;
        }

        .description-list li:hover {
          color: #007bff;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .specs-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e9ecef;
        }

        .specs-table td:first-child {
          width: 160px;
          background: #f8f9fa;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-item {
          padding: 24px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .review-rating {
          color: #ffc107;
          margin-top: 4px;
        }

        .review-date {
          color: #999;
          font-size: 14px;
        }

        .review-item h4 {
          font-size: 14px;
          margin-bottom: 6px;
        }

        .review-item p {
          color: #666;
          line-height: 1.6;
        }

        .related-products {
          margin-bottom: 40px;
        }

        .related-products h2 {
          font-size: 22px;
          margin-bottom: 20px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .product-main {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .product-gallery {
            position: static;
          }
        }

        /* ===== NEW SECTIONS CSS ===== */

        .variants-section {
          margin: 12px 0;
          padding: 12px 0;
          border-top: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
        }

        .variants-section h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
          color: #1a1a1a;
        }

        .variants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 12px;
        }

        .variant-card {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s ease;
        }

        .variant-card:hover {
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
        }

        .variant-card.active {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.05);
        }

        .variant-image {
          margin-bottom: 8px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .variant-image img {
          max-width: 100%;
          max-height: 100%;
        }

        .variant-name {
          font-size: 12px;
          color: #666;
          display: block;
          text-transform: capitalize;
        }

        .limited-stock-alert {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 6px;
          padding: 10px 12px;
          margin: 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #856404;
          font-weight: 600;
        }

        .alert-icon {
          font-size: 18px;
        }

        .product-assurance {
          display: flex;
          gap: 16px;
          margin: 8px 0;
          padding: 12px 0;
          border-top: 1px solid #e9ecef;
          border-bottom: 1px solid #e9ecef;
          flex-wrap: wrap;
        }

        .people-viewing,
        .assurance-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #555;
          font-weight: 500;
        }

        .people-viewing .icon,
        .assurance-badge .badge-icon {
          font-size: 16px;
          line-height: 1;
        }

        .offers-section {
          margin: 12px 0;
          padding: 16px;
          background: linear-gradient(135deg, #fff8f0 0%, #fffaf7 100%);
          border-radius: 8px;
          border: 1px solid #ffe6d5;
        }

        .offers-section h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          color: #ff6b35;
        }

        .offers-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .offer-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }

        .offer-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .offer-text {
          flex: 1;
        }

        .promo-code {
          background: #ff6b35;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
          margin-left: 6px;
          display: inline-block;
        }

        .emi-section {
          margin: 12px 0;
          padding: 0;
        }

        .emi-section h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          color: #1a1a1a;
        }

        .emi-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .emi-card {
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 10px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .emi-card:hover {
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
        }

        .bank-name {
          font-size: 12px;
          font-weight: 700;
          color: #666;
          margin-bottom: 6px;
          text-transform: capitalize;
        }

        .emi-amount {
          font-size: 18px;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 4px;
        }

        .emi-tenure {
          font-size: 12px;
          color: #999;
        }

        .protection-plan-section {
          margin: 12px 0;
          padding: 14px;
          background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
          border: 1px solid #e3f2fd;
          border-radius: 6px;
        }

        .protection-plan-section h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          color: #007bff;
        }

        .warranty-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }

        .warranty-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .warranty-card:hover {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.02);
        }

        .warranty-card.selected {
          border-color: #007bff;
          background: rgba(0, 123, 255, 0.05);
        }

        .warranty-card input[type="radio"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .warranty-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
        }

        .warranty-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .warranty-price {
          font-size: 16px;
          font-weight: 700;
          color: #007bff;
        }

        .warranty-description {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          margin-top: 12px;
          padding: 12px;
          background: white;
          border-radius: 6px;
        }

        .warranty-summary {
          margin-top: 16px;
        }

        .warranty-cost-breakdown {
          background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
          border: 1px solid #e3f2fd;
          border-radius: 8px;
          padding: 16px;
          margin-top: 12px;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
          font-size: 14px;
        }

        .cost-row.total {
          border-bottom: none;
          padding: 12px 0;
          margin-top: 4px;
          padding-top: 12px;
          border-top: 2px solid #007bff;
        }

        .cost-label {
          color: #555;
          font-weight: 600;
        }

        .cost-value {
          color: #1a1a1a;
          font-weight: 600;
        }

        .cost-row.total .cost-label {
          color: #007bff;
          font-size: 16px;
        }

        .total-price {
          color: #28a745;
          font-size: 18px;
          font-weight: 700;
        }

        .delivery-stores-section {
          margin: 12px 0;
          padding: 0;
        }

        .delivery-stores-section h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 10px;
          color: #1a1a1a;
        }

        .stores-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .store-card {
          border: 1px solid #e9ecef;
          border-radius: 6px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .store-card:hover {
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
        }

        .store-header {
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }

        .store-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .store-name {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .store-distance {
          font-size: 12px;
          color: #999;
        }

        .store-delivery {
          font-size: 12px;
          font-weight: 600;
          color: #28a745;
          white-space: nowrap;
        }

        .store-details {
          padding: 8px 10px;
          background: white;
          border-top: 1px solid #e9ecef;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .store-address {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        .store-phone {
          display: flex;
          gap: 8px;
          font-size: 12px;
          color: #666;
        }

        .store-phone a {
          color: #007bff;
          font-weight: 600;
          text-decoration: none;
        }

        .store-phone a:hover {
          text-decoration: underline;
        }

        .specifications-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .spec-category {
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 24px;
        }

        .spec-category:last-child {
          border-bottom: none;
        }

        .spec-category h4 {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          color: #007bff;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        /* DELIVERY CHECKER SECTION */
        .delivery-checker-section {
          background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%);
          border: 1px solid #e3f2fd;
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .delivery-checker-section h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pincode-input-group {
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .input-wrapper {
          display: flex;
          gap: 8px;
          flex: 1;
          min-width: 280px;
        }

        .pincode-input {
          flex: 1;
          padding: 12px 16px;
          border: 1.5px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }

        .pincode-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .pincode-input::placeholder {
          color: #999;
        }

        .check-delivery-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .check-delivery-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
          transform: translateY(-1px);
        }

        .check-delivery-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .locate-btn {
          padding: 12px 20px;
          background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .locate-btn:hover {
          background: linear-gradient(135deg, #1e7e34 0%, #155c2e 100%);
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
          transform: translateY(-1px);
        }

        /* Delivery Results */
        .delivery-result {
          margin-top: 16px;
          padding: 16px;
          border-radius: 8px;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delivery-result.success {
          background: #f0fdf4;
          border: 1px solid #dcfce7;
        }

        .delivery-result.unavailable {
          background: #fef2f2;
          border: 1px solid #fee2e2;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .status-icon {
          font-size: 24px;
          font-weight: bold;
        }

        .delivery-result.success .status-icon {
          color: #22c55e;
        }

        .delivery-result.unavailable .status-icon {
          color: #ef4444;
        }

        .result-header h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .delivery-result.success .result-header h5 {
          color: #15803d;
        }

        .delivery-result.unavailable .result-header h5 {
          color: #991b1b;
        }

        .delivery-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
        }

        .detail-label {
          color: #666;
          font-weight: 600;
        }

        .detail-value {
          color: #1a1a1a;
          font-weight: 700;
        }

        .free-shipping {
          color: #22c55e;
          font-weight: 700;
          background: #f0fdf4;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
        }

        .unavailable-message {
          margin: 0 0 12px 0;
          color: #991b1b;
          font-size: 14px;
          line-height: 1.6;
        }

        .request-delivery-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .request-delivery-btn:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
          transform: translateY(-1px);
        }

        /* Delivery Request Form */
        .delivery-request-form {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-top: 16px;
        }

        .delivery-request-form h5 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .form-subtitle {
          margin: 0 0 16px 0;
          font-size: 13px;
          color: #666;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #555;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .submit-request-btn {
          flex: 1;
          padding: 12px 16px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-request-btn:hover {
          background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
          transform: translateY(-1px);
        }

        .cancel-request-btn {
          flex: 1;
          padding: 12px 16px;
          background: #f3f4f6;
          color: #555;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-request-btn:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }

        @media (max-width: 768px) {
          .product-main {
            padding: 24px;
            grid-template-columns: 1fr;
          }

          .product-gallery {
            margin-bottom: 24px;
          }

          .nav-arrow {
            width: 40px;
            height: 40px;
          }

          .prev-arrow {
            left: 8px;
          }

          .next-arrow {
            right: 8px;
          }

          .zoom-hint {
            display: none;
          }

          .product-title {
            font-size: 24px;
          }

          .current-price {
            font-size: 28px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-large {
            width: 100%;
          }

          .tabs-header {
            overflow-x: auto;
          }

          .tabs-header button {
            white-space: nowrap;
          }

          .tabs-content {
            padding: 18px;
          }

          .variants-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          }

          .emi-cards {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .product-assurance {
            flex-direction: column;
            gap: 12px;
          }

          .store-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .store-delivery {
            width: 100%;
          }

          .pincode-input-group {
            flex-direction: column;
          }

          .input-wrapper {
            min-width: auto;
          }

          .check-delivery-btn,
          .locate-btn {
            width: 100%;
          }

          .delivery-checker-section {
            padding: 16px;
          }

          .form-actions {
            flex-direction: column;
          }

          .submit-request-btn,
          .cancel-request-btn {
            width: 100%;
          }

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>

      {/* Razorpay Payment Modal */}
      <RazorpayPayment
        paymentType="direct"
        productId={product.id}
        quantity={quantity}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(data) => {
          setIsPaymentModalOpen(false)
          alert('Payment successful! Redirecting to order confirmation...')
        }}
        onFailure={(error) => {
          alert(`Payment failed: ${error}`)
        }}
      />
    </div>
  )
}

function RelatedProductCard({ product }) {
  const displayPrice = product.discount_price || product.price
  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'

  return (
    <Link href={`/products/${product.slug}`} className="related-product-card">
      <div className="product-image">
        <Image 
          src={mainImage}
          alt={product.name}
          width={300}
          height={300}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <div className="rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
          <span className="count">({product.review_count})</span>
        </div>
        <div className="price">
          <span className="current">₹{displayPrice.toLocaleString('en-IN')}</span>
          {product.discount_price && (
            <span className="original">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .related-product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
        }

        .related-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .product-image {
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .product-info {
          padding: 16px;
        }

        .product-info h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .stars {
          color: #ffc107;
          font-size: 14px;
        }

        .count {
          font-size: 12px;
          color: #666;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current {
          font-size: 18px;
          font-weight: 700;
          color: #28a745;
        }

        .original {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }

        /* WARRANTY TAB STYLES */
        .warranty-tab {
          padding: 20px 0;
        }

        .warranty-details {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .warranty-details h4 {
          margin-top: 16px;
          margin-bottom: 10px;
          color: #1a1a1a;
          font-size: 15px;
          font-weight: 600;
        }

        .warranty-list {
          list-style: none;
          padding: 0;
          margin: 12px 0 0 0;
        }

        .warranty-list li {
          padding: 10px 0 10px 10px;
          color: #555;
          font-size: 13px;
          line-height: 1.6;
          position: relative;
        }

        .warranty-list li:before {
          content: "✓";
          position: absolute;
          left: -10px;
          color: #28a745;
          font-weight: bold;
        }

        .warranty-plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }

        .plan-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
        }

        .plan-card h5 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 600;
        }

        .plan-price {
          font-size: 18px;
          font-weight: 700;
          color: #28a745;
          margin: 8px 0;
        }

        .plan-duration {
          font-size: 13px;
          color: #666;
          margin: 4px 0;
        }

        .plan-description {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          margin: 8px 0;
        }

        /* CARE TAB STYLES */
        .care-tab {
          padding: 0;
        }

        .care-content {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .care-content h4 {
          margin-top: 20px;
          margin-bottom: 12px;
          color: #007bff;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 8px;
          border-bottom: 2px solid #007bff;
          display: inline-block;
        }

        .care-content h4:first-child {
          margin-top: 0;
        }

        .care-list {
          list-style: none;
          padding: 0;
          margin: 12px 0 18px 0;
        }

        .care-list li {
          padding: 10px 0 10px 10px;
          position: relative;
          color: #555;
          font-size: 13px;
          line-height: 1.6;
        }

        .care-list li:before {
          content: "•";
          position: absolute;
          left: -10px;
          color: #28a745;
          font-weight: bold;
          font-size: 14px;
        }

        .care-list li strong {
          color: #1a1a1a;
        }

        /* BRAND TAB STYLES */
        .brand-tab {
          padding: 0;
        }

        .brand-content {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .brand-section {
          margin-bottom: 24px;
        }

        .brand-section h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #007bff;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-bottom: 8px;
          border-bottom: 2px solid #007bff;
          display: inline-block;
        }

        .brand-section p {
          color: #555;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 14px;
        }

        .brand-highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 14px;
          margin-bottom: 20px;
        }

        .highlight-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          border-left: 3px solid #28a745;
          transition: all 0.3s ease;
        }

        .highlight-item:hover {
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
          border-left-color: #007bff;
        }

        .highlight-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .highlight-text {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .category-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #ddd;
        }

        .category-section h4 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #1a1a1a;
          font-size: 15px;
          font-weight: 600;
        }

        .category-section p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .view-collection-link {
          display: inline-block;
          color: #007bff;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .view-collection-link:hover {
          color: #0056b3;
        }

        .collection-benefits {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #ddd;
        }

        .collection-benefits h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #1a1a1a;
          font-size: 15px;
          font-weight: 600;
        }

        .collection-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .collection-benefits li {
          padding: 8px 0 8px 10px;
          position: relative;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }

        .collection-benefits li:before {
          content: "✓";
          position: absolute;
          left: -10px;
          color: #28a745;
          font-weight: bold;
        }

        /* STORES TAB STYLES */
        .stores-tab {
          padding: 20px 0;
        }

        .stores-intro {
          color: #666;
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .stores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .store-detailed-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .store-detailed-card:hover {
          border-color: #007bff;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
        }

        .store-header-detail {
          padding: 14px 16px;
          background: #f9f9f9;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .store-header-detail h4 {
          margin: 0;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 600;
        }

        .store-distance {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
        }

        .store-body-detail {
          padding: 16px;
        }

        .store-address-detail {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .store-phone-detail {
          font-size: 13px;
          color: #666;
          margin: 0 0 8px 0;
        }

        .store-phone-detail a {
          color: #007bff;
          font-weight: 600;
          text-decoration: none;
        }

        .store-phone-detail a:hover {
          text-decoration: underline;
        }

        .store-delivery-detail {
          font-size: 13px;
          color: #28a745;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .store-directions-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .store-directions-btn:hover {
          background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
          box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
          transform: translateY(-1px);
        }

        .store-directions-btn:active {
          transform: translateY(0);
        }

        .no-stores {
          background: #f9f9f9;
          padding: 30px 20px;
          border-radius: 8px;
          text-align: center;
        }

        .no-stores p {
          color: #666;
          font-size: 14px;
          margin: 0 0 12px 0;
          line-height: 1.6;
        }

        .store-locator-link {
          display: inline-block;
          color: #007bff;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .store-locator-link:hover {
          color: #0056b3;
        }
      `}</style>
    </Link>
  )
}
