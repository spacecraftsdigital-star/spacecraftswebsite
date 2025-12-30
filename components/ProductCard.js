// Modern Product Card Component
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const finalPrice = product.discount_price || product.price
  const imageUrl = product.images?.[0] || product.coverImage || '/placeholder-product.jpg'

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        border: '1px solid #eee',
        transition: 'all 0.3s ease'
      }}
    >
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        
        {/* Image Container */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
          <Image
            src={imageError ? '/placeholder-product.jpg' : imageUrl}
            alt={product.name}
            fill
            style={{ 
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.5s ease'
            }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
          
          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {discountPercentage > 0 && (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '4px'
              }}>
                -{discountPercentage}%
              </span>
            )}
            {product.tags?.includes('bestseller') && (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#f39c12',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '4px'
              }}>
                Bestseller
              </span>
            )}
            {product.tags?.includes('trending') && (
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#9b59b6',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '4px'
              }}>
                Trending
              </span>
            )}
          </div>

          {/* Quick Actions - Show on Hover */}
          <div 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: '18px'
              }}
              onClick={(e) => {
                e.preventDefault()
                // Add to wishlist logic
                console.log('Add to wishlist:', product.id)
              }}
              aria-label="Add to wishlist"
            >
              ♡
            </button>
            <button
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: '18px'
              }}
              onClick={(e) => {
                e.preventDefault()
                // Quick view logic
                console.log('Quick view:', product.id)
              }}
              aria-label="Quick view"
            >
              👁
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#e74c3c' }}>
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ padding: '20px' }}>
          {/* Product Name */}
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#1a1a1a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4',
            minHeight: '44px'
          }}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < Math.round(product.rating) ? '#f39c12' : '#ddd', fontSize: '14px' }}>
                    ★
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#888' }}>
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
            {product.discount_price && (
              <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Delivery Info */}
          {product.delivery_info && (
            <p style={{ fontSize: '12px', color: '#27ae60', marginBottom: '12px' }}>
              ✓ {product.delivery_info.split('.')[0]}
            </p>
          )}

          {/* Add to Cart Button */}
          <button
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isHovered ? '#1a1a1a' : 'transparent',
              color: isHovered ? '#fff' : '#1a1a1a',
              border: '2px solid #1a1a1a',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onClick={(e) => {
              e.preventDefault()
              // Add to cart logic
              console.log('Add to cart:', product.id)
            }}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>

      <style jsx>{`
        .product-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transform: translateY(-4px);
        }
      `}</style>
    </motion.article>
  )
}
