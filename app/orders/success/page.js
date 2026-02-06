'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { authenticatedFetch } from '../../../lib/authenticatedFetch'
import { supabase } from '../../../lib/supabaseClient'

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // GTM conversion tracking
        try {
          window.dataLayer = window.dataLayer || []
          localStorage.removeItem('cart')
          localStorage.removeItem('wishlist')
          window.dataLayer.push({
            event: 'purchase',
            ecommerce: {
              transaction_id: searchParams.get('order_id') || 'TBD',
              value: 0
            }
          })
          if (window.gtag) {
            window.gtag('event', 'conversion', {
              send_to: 'AW-CONVERSION_ID/label',
              value: 0
            })
          }
        } catch (e) {
          console.warn('GTM tracking error:', e)
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const orderId = searchParams.get('order_id')
        if (!orderId) {
          setError('Order ID not found')
          setLoading(false)
          return
        }

        // Fetch order details
        const response = await authenticatedFetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.order)
        } else {
          setError('Failed to fetch order details')
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="success-container">
        <div className="loading">Processing your order...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="success-container">
        <div className="error-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <Link href="/orders" className="btn-primary">View Orders</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1>Order Confirmed!</h1>
        <p className="success-message">Thank you for your purchase</p>

        {order && (
          <>
            <div className="order-details">
              <div className="detail-item">
                <span className="label">Order ID:</span>
                <span className="value">#{order.id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment ID:</span>
                <span className="value">{order.razorpay_payment_id || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Amount Paid:</span>
                <span className="value">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Order Date:</span>
                <span className="value">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value status confirmed">{order.status.toUpperCase()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Payment Status:</span>
                <span className="value status completed">{order.payment_status.toUpperCase()}</span>
              </div>
            </div>

            <div className="next-steps">
              <h3>What's Next?</h3>
              <ol>
                <li>You'll receive a confirmation email shortly</li>
                <li>Our team will process your order within 24 hours</li>
                <li>You'll receive tracking details via email and SMS</li>
                <li>Track your order anytime in your account</li>
              </ol>
            </div>
          </>
        )}

        <div className="action-buttons">
          <Link href={`/orders/${order?.id}`} className="btn-primary">
            View Order Details
          </Link>
          <Link href="/products" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>

      <style jsx>{`
        .success-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .success-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .success-icon {
          margin-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .success-icon svg {
          color: #10b981;
          stroke: currentColor;
        }

        h1 {
          font-size: 28px;
          color: #333;
          margin: 0 0 8px 0;
        }

        .success-message {
          color: #666;
          font-size: 16px;
          margin: 0 0 32px 0;
        }

        .order-details {
          background: #f9fafb;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          text-align: left;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .label {
          color: #666;
          font-weight: 500;
        }

        .value {
          color: #333;
          font-weight: 600;
        }

        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .status.confirmed {
          background: #dcfce7;
          color: #166534;
        }

        .status.completed {
          background: #dbeafe;
          color: #1e40af;
        }

        .next-steps {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 24px;
          text-align: left;
        }

        .next-steps h3 {
          margin: 0 0 12px 0;
          color: #166534;
          font-size: 16px;
        }

        .next-steps ol {
          margin: 0;
          padding-left: 20px;
          color: #166534;
        }

        .next-steps li {
          margin: 8px 0;
          font-size: 14px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .error-state {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
        }

        .error-state svg {
          color: #ef4444;
          margin-bottom: 16px;
        }

        .loading {
          color: #666;
          text-align: center;
          padding: 40px;
          font-size: 16px;
        }
      `}</style>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}
