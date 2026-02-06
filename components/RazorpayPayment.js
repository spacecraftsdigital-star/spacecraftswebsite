'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../lib/authenticatedFetch'

/**
 * RazorpayPayment Component
 * Handles Razorpay payment flow with modal/overlay
 * 
 * Props:
 * - items: Array of {product_id, quantity}
 * - paymentType: 'cart' | 'direct'
 * - productId: (for direct payment)
 * - quantity: (for direct payment)
 * - addressId: Selected address ID (optional)
 * - onSuccess: Callback on successful payment
 * - onFailure: Callback on failed payment
 * - onClose: Callback to close payment modal
 * - isOpen: Whether payment modal is open
 */
export default function RazorpayPayment({
  items = [],
  paymentType = 'cart',
  productId = null,
  quantity = 1,
  addressId = null,
  onSuccess = () => {},
  onFailure = () => {},
  onClose = () => {},
  isOpen = false
}) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [razorpayOrderId, setRazorpayOrderId] = useState(null)

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePaymentClick = async () => {
    setError(null)
    setIsProcessing(true)

    try {
      // Step 1: Create order and Razorpay order
      const orderPayload = {
        items: paymentType === 'cart' ? items : [],
        address_id: addressId,
        payment_type: paymentType,
        ...(paymentType === 'direct' && { product_id: productId, quantity })
      }

      console.log('Creating order with payload:', orderPayload)

      const orderResponse = await authenticatedFetch('/api/razorpay/create-order', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      })

      const orderData = await orderResponse.json()
      console.log('Order created:', orderData)

      if (!orderResponse.ok) {
        setError(orderData.error || 'Failed to create order')
        setIsProcessing(false)
        return
      }

      setOrderId(orderData.order_id)
      setRazorpayOrderId(orderData.razorpay_order_id)

      // Step 2: Open Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderData.razorpay_order_id,
        amount: orderData.amount_paise,
        currency: 'INR',
        name: 'Spacecrafts Furniture',
        description: paymentType === 'direct' ? 'Product Purchase' : 'Cart Checkout',
        customer: {
          name: orderData.customer_name,
          email: orderData.customer_email
        },
        handler: async (response) => {
          // Step 3: Verify payment signature
          await verifyAndCompletePayment(
            response.razorpay_payment_id,
            orderData.order_id,
            orderData.razorpay_order_id,
            response.razorpay_signature
          )
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed')
            setIsProcessing(false)
            onFailure('Payment cancelled by user')
          }
        },
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email
        },
        theme: {
          color: '#2563eb'
        }
      }

      // Create Razorpay instance and open
      if (window.Razorpay) {
        const razorpayInstance = new window.Razorpay(options)
        razorpayInstance.open()
      } else {
        setError('Razorpay not loaded. Please refresh and try again.')
        setIsProcessing(false)
      }

    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  const verifyAndCompletePayment = async (paymentId, orderId, razorpayOrderId, signature) => {
    try {
      console.log('Verifying payment:', { paymentId, orderId, razorpayOrderId })

      const verifyResponse = await authenticatedFetch('/api/razorpay/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          order_id: orderId
        })
      })

      const verifyData = await verifyResponse.json()
      console.log('Verification response:', verifyData)

      if (!verifyResponse.ok) {
        setError(verifyData.error || 'Payment verification failed')
        onFailure(verifyData.error || 'Payment verification failed')
        setIsProcessing(false)
        return
      }

      // Payment successful!
      setIsProcessing(false)
      onSuccess({
        order_id: orderId,
        razorpay_payment_id: paymentId,
        status: 'completed'
      })

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push(`/orders/success?order_id=${orderId}`)
      }, 2000)

    } catch (err) {
      console.error('Payment verification error:', err)
      setError(err.message || 'Failed to verify payment')
      onFailure(err.message || 'Failed to verify payment')
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Complete Payment</h2>
          <button 
            className="payment-modal-close" 
            onClick={onClose}
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        <div className="payment-modal-content">
          {error && (
            <div className="payment-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          <div className="payment-info">
            <p><strong>Payment Method:</strong> Razorpay (Credit/Debit Card, UPI, Net Banking)</p>
            <p><strong>Amount:</strong> Click "Pay Now" to proceed with payment</p>
          </div>

          <div className="payment-modal-actions">
            <button 
              className="btn-secondary" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={handlePaymentClick}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner-small"></span>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .payment-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .payment-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .payment-modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .payment-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .payment-modal-close:hover:not(:disabled) {
          background: #f3f4f6;
          color: #000;
        }

        .payment-modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-modal-content {
          padding: 20px;
        }

        .payment-error {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .payment-info {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .payment-info p {
          margin: 8px 0;
        }

        .payment-info strong {
          color: #1e40af;
        }

        .payment-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-primary, .btn-secondary {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner-small {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
