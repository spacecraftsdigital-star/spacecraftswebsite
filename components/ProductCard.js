// Luxury Product Card Component
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        border: '1px solid rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.5s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94), border-color 0.5s ease',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        borderColor: isHovered ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.06)',
      }}
    >
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        
        {/* Image Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4/5',
          overflow: 'hidden',
          backgroundColor: '#fafaf8',
        }}>
          <Image
            src={imageError ? '/placeholder-product.jpg' : imageUrl}
            alt={product.name}
            fill
            style={{ 
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />

          {/* Luxury gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.35) 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
          
          {/* Badges — frosted glass */}
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 2,
          }}>
            {discountPercentage > 0 && (
              <span style={{
                padding: '5px 12px',
                background: 'rgba(200, 50, 50, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '20px',
                letterSpacing: '0.5px',
              }}>
                -{discountPercentage}%
              </span>
            )}
            {product.tags?.includes('bestseller') && (
              <span style={{
                padding: '5px 12px',
                background: 'rgba(180, 130, 50, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '20px',
                letterSpacing: '0.5px',
              }}>
                Bestseller
              </span>
            )}
            {product.tags?.includes('trending') && (
              <span style={{
                padding: '5px 12px',
                background: 'rgba(100, 60, 150, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                borderRadius: '20px',
                letterSpacing: '0.5px',
              }}>
                Trending
              </span>
            )}
          </div>

          {/* Quick Actions — floating glass buttons */}
          <div 
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              zIndex: 2,
            }}
          >
            <button
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                fontSize: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={(e) => {
                e.preventDefault()
                console.log('Add to wishlist:', product.id)
              }}
              aria-label="Add to wishlist"
            >
              ♡
            </button>
            <button
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                fontSize: '16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={(e) => {
                e.preventDefault()
                console.log('Quick view:', product.id)
              }}
              aria-label="Quick view"
            >
              👁
            </button>
          </div>

          {/* Product name overlay on image bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px 16px 14px',
            zIndex: 2,
            pointerEvents: 'none',
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              color: '#fff',
              letterSpacing: '-0.01em',
              lineHeight: '1.35',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              margin: 0,
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}>
              {product.name}
            </h3>
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3,
            }}>
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                color: '#c0392b',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
              }}>
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Info — compact luxury details */}
        <div style={{ padding: '16px 16px 18px' }}>

          {/* Rating row */}
          {product.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '1px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{
                    color: i < Math.round(product.rating) ? '#c9a84c' : '#e0ddd5',
                    fontSize: '13px',
                  }}>
                    ★
                  </span>
                ))}
              </div>
              <span style={{
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: '#999',
                fontWeight: '500',
              }}>
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Price block */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginBottom: '10px',
          }}>
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              color: '#1a1a1a',
              letterSpacing: '-0.02em',
            }}>
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
            {product.discount_price && (
              <span style={{
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                color: '#b0aaa0',
                textDecoration: 'line-through',
                fontWeight: '400',
              }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
            {discountPercentage > 0 && (
              <span style={{
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: '#c0392b',
                fontWeight: '600',
              }}>
                Save {discountPercentage}%
              </span>
            )}
          </div>

          {/* Delivery Info */}
          {product.delivery_info && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '14px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
              <span style={{
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                color: '#27ae60',
                fontWeight: '500',
              }}>
                {product.delivery_info.split('.')[0]}
              </span>
            </div>
          )}

          {/* Add to Cart — luxury pill button */}
          <button
            style={{
              width: '100%',
              padding: '11px 20px',
              backgroundColor: isHovered ? '#1a1a1a' : 'transparent',
              color: isHovered ? '#fff' : '#1a1a1a',
              border: '1.5px solid #1a1a1a',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: '700',
              fontFamily: 'Inter, sans-serif',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              opacity: product.stock === 0 ? 0.4 : 1,
            }}
            onClick={(e) => {
              e.preventDefault()
              console.log('Add to cart:', product.id)
            }}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.article>
  )
}
