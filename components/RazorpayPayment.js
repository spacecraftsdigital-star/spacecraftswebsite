'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function RazorpayPayment({
  items = [],
  paymentType = 'cart',
  productId = null,
  quantity = 1,
  addressId = null,
  amount = 0,
  onSuccess = () => {},
  onFailure = () => {},
  onClose = () => {},
  isOpen = false
}) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="checkout.razorpay.com"]')) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handlePaymentClick = async () => {
    setError(null)
    setIsProcessing(true)
    try {
      const orderPayload = {
        items: paymentType === 'cart' ? items : [],
        address_id: addressId,
        payment_type: paymentType,
        ...(paymentType === 'direct' && { product_id: productId, quantity })
      }

      const orderResponse = await authenticatedFetch('/api/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      })
      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        setError(orderData.error || 'Failed to create order')
        setIsProcessing(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_SNZPmHU5RD7fq8',
        order_id: orderData.razorpay_order_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        name: 'Spacecrafts Furniture',
        description: paymentType === 'direct' ? 'Product Purchase' : 'Cart Checkout',
        handler: async (response) => {
          try {
            const verifyRes = await authenticatedFetch('/api/razorpay/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: orderData.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order_id
              })
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok) {
              setError(verifyData.error || 'Payment verification failed')
              onFailure(verifyData.error)
              setIsProcessing(false)
              return
            }
            setIsProcessing(false)
            onSuccess({ order_id: orderData.order_id, razorpay_payment_id: response.razorpay_payment_id, status: 'completed' })
            router.push(`/orders/success?order_id=${orderData.order_id}`)
          } catch (err) {
            setError('Failed to verify payment')
            onFailure(err.message)
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            onFailure('Payment cancelled')
          }
        },
        prefill: { name: orderData.customer_name, email: orderData.customer_email },
        theme: { color: '#222' }
      }

      if (window.Razorpay) {
        new window.Razorpay(options).open()
      } else {
        setError('Payment gateway not loaded. Please refresh.')
        setIsProcessing(false)
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  const itemCount = items.length || (paymentType === 'direct' ? 1 : 0)

  return (
    <div className="rp-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose() }}>
      <div className="rp-modal">
        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-left">
            <div className="rp-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h2>Secure Checkout</h2>
              <span>Spacecrafts Furniture</span>
            </div>
          </div>
          <button className="rp-close" onClick={onClose} disabled={isProcessing}>✕</button>
        </div>

        {/* Body */}
        <div className="rp-body">
          {error && (
            <div className="rp-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
              {error}
            </div>
          )}

          {/* Order info */}
          <div className="rp-order-info">
            <div className="rp-info-row">
              <span>Items</span>
              <span>{itemCount} {itemCount === 1 ? 'product' : 'products'}</span>
            </div>
            <div className="rp-info-row">
              <span>Payment via</span>
              <span>Razorpay</span>
            </div>
            <div className="rp-info-row">
              <span>Methods accepted</span>
              <span>UPI · Cards · Net Banking · Wallets</span>
            </div>
          </div>

          {amount > 0 && (
            <div className="rp-amount-box">
              <span>Amount to pay</span>
              <span className="rp-amount">₹{Number(amount).toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Trust badges */}
          <div className="rp-trust">
            <div className="rp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SSL Encrypted
            </div>
            <div className="rp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Verified Merchant
            </div>
            <div className="rp-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Secure Payment
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="rp-footer">
          <button className="rp-cancel" onClick={onClose} disabled={isProcessing}>Cancel</button>
          <button className="rp-pay" onClick={handlePaymentClick} disabled={isProcessing}>
            {isProcessing ? (
              <><span className="rp-spinner"></span> Processing...</>
            ) : (
              <>Pay Now{amount > 0 ? ` · ₹${Number(amount).toLocaleString('en-IN')}` : ''}</>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .rp-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center;
          justify-content: center; z-index: 9999; backdrop-filter: blur(2px);
        }
        .rp-modal {
          background: #fff; border-radius: 12px; width: 420px; max-width: 92vw;
          box-shadow: 0 20px 60px rgba(0,0,0,.25); animation: rpSlide .25s ease-out;
          overflow: hidden;
        }
        @keyframes rpSlide { from { transform: translateY(16px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

        /* Header */
        .rp-header {
          background: #222; color: #fff; padding: 16px 20px; display: flex; align-items: center;
          justify-content: space-between;
        }
        .rp-header-left { display: flex; align-items: center; gap: 12px; }
        .rp-logo {
          width: 36px; height: 36px; background: rgba(255,255,255,.12); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-header h2 { margin: 0; font-size: 15px; font-weight: 700; }
        .rp-header span { font-size: 11px; color: rgba(255,255,255,.6); }
        .rp-close {
          background: rgba(255,255,255,.1); border: none; color: #fff; width: 30px; height: 30px;
          border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: background .15s;
        }
        .rp-close:hover:not(:disabled) { background: rgba(255,255,255,.2); }
        .rp-close:disabled { opacity: .4; cursor: not-allowed; }

        /* Body */
        .rp-body { padding: 20px; }
        .rp-error {
          background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 12px;
          border-radius: 6px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 500;
        }
        .rp-order-info { margin-bottom: 16px; }
        .rp-info-row {
          display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px;
          border-bottom: 1px solid #f5f5f5; color: #555;
        }
        .rp-info-row:last-child { border-bottom: none; }
        .rp-info-row span:first-child { color: #999; }
        .rp-info-row span:last-child { font-weight: 600; color: #333; }

        .rp-amount-box {
          background: #f9fafb; border: 1px solid #eee; border-radius: 8px; padding: 14px 16px;
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .rp-amount-box span:first-child { font-size: 13px; color: #888; }
        .rp-amount { font-size: 22px; font-weight: 800; color: #222; }

        .rp-trust { display: flex; gap: 8px; flex-wrap: wrap; }
        .rp-badge {
          display: flex; align-items: center; gap: 4px; padding: 5px 10px;
          background: #f9fafb; border: 1px solid #eee; border-radius: 20px;
          font-size: 11px; color: #666; font-weight: 500;
        }

        /* Footer */
        .rp-footer {
          padding: 16px 20px; border-top: 1px solid #eee; display: flex; gap: 10px;
          justify-content: flex-end; background: #fafafa;
        }
        .rp-cancel {
          padding: 10px 20px; background: #fff; border: 1px solid #ddd; border-radius: 6px;
          font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s;
        }
        .rp-cancel:hover:not(:disabled) { border-color: #bbb; color: #333; }
        .rp-cancel:disabled { opacity: .5; cursor: not-allowed; }
        .rp-pay {
          padding: 10px 28px; background: #222; color: #fff; border: none; border-radius: 6px;
          font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center;
          gap: 8px; transition: background .15s;
        }
        .rp-pay:hover:not(:disabled) { background: #000; }
        .rp-pay:disabled { background: #999; cursor: not-allowed; }
        .rp-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%; animation: rpSpin .6s linear infinite;
        }
        @keyframes rpSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
