"use client"
import { useEffect } from 'react'

export default function SuccessPage() {
  useEffect(() => {
    // Push purchase event to dataLayer for GTM/Google Ads
    try {
      window.dataLayer = window.dataLayer || []
      // Clear guest cart stored in localStorage
      try { localStorage.removeItem('cart'); localStorage.removeItem('wishlist') } catch (e) {}

      // Push purchase event (placeholders)
      window.dataLayer.push({ event: 'purchase', ecommerce: { transaction_id: new URLSearchParams(window.location.search).get('session_id') || 'TBD', value: 0 } })
      // Google Ads conversion (placeholder) - replace with real conversion ID and label
      if (window.gtag) {
        window.gtag('event', 'conversion', { send_to: 'AW-CONVERSION_ID/label', value: 0 })
      }
    } catch (e) { console.warn(e) }
  }, [])

  return (
    <div className="container">
      <h1>Payment Success</h1>
      <p>Thank you for your order. We'll email the receipt and update your orders shortly.</p>
    </div>
  )
}

