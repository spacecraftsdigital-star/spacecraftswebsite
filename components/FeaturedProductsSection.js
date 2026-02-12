// Featured Products Section
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

const tabs = [
  { id: 'new-arrivals', label: 'New Arrivals', icon: '✦', filter: (p) => true },
  { id: 'bestsellers', label: 'Bestsellers', icon: '★', filter: (p) => p.tags?.includes('bestseller') },
  { id: 'trending', label: 'Trending', icon: '↗', filter: (p) => p.tags?.includes('trending') },
  { id: 'on-sale', label: 'On Sale', icon: '%', filter: (p) => p.discount_price > 0 }
]

export default function FeaturedProductsSection({ products = [] }) {
  const [activeTab, setActiveTab] = useState('new-arrivals')
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 })
  const tabRefs = useRef({})
  const tabContainerRef = useRef(null)

  useEffect(function() {
    var observer = new IntersectionObserver(
      function(entries) {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return function() { observer.disconnect() }
  }, [])

  // Update sliding indicator position with reliable getBoundingClientRect
  useEffect(function() {
    function updateIndicator() {
      var el = tabRefs.current[activeTab]
      var container = tabContainerRef.current
      if (el && container) {
        var elRect = el.getBoundingClientRect()
        var containerRect = container.getBoundingClientRect()
        setTabIndicator({
          left: elRect.left - containerRect.left,
          width: elRect.width,
        })
      }
    }
    updateIndicator()
    // Recalc on window resize
    window.addEventListener('resize', updateIndicator)
    return function() { window.removeEventListener('resize', updateIndicator) }
  }, [activeTab])

  const filteredProducts = products
    .filter(tabs.find(t => t.id === activeTab)?.filter || (() => true))
    .slice(0, 6)

  const totalFiltered = products
    .filter(tabs.find(t => t.id === activeTab)?.filter || (() => true)).length

  const remainingCount = totalFiltered - 6

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '36px 20px 42px',
        background: 'linear-gradient(180deg, #f8f7f4 0%, #ffffff 50%, #f8f7f4 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                width: '28px',
                height: '1.5px',
                background: 'linear-gradient(90deg, transparent, #1a1a1a)',
                display: 'block',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '4px',
                color: '#999',
              }}
            >
              Handpicked
            </span>
            <span
              style={{
                width: '28px',
                height: '1.5px',
                background: 'linear-gradient(90deg, #1a1a1a, transparent)',
                display: 'block',
              }}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(32px, 4vw, 46px)',
              fontWeight: 800,
              color: '#1a1a1a',
              margin: '0 0 24px',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
            }}
          >
            Featured Products
          </motion.h2>

          {/* Tab Navigation with sliding indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            ref={tabContainerRef}
            style={{
              display: 'inline-flex',
              position: 'relative',
              gap: '4px',
              padding: '4px',
              borderRadius: '50px',
              background: '#f0eeeb',
            }}
          >
            {/* Sliding pill indicator */}
            {tabIndicator.width > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: tabIndicator.left + 'px',
                  width: tabIndicator.width + 'px',
                  height: 'calc(100% - 8px)',
                  borderRadius: '50px',
                  background: '#1a1a1a',
                  transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />
            )}

            {tabs.map(function(tab) {
              var isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  ref={function(el) { tabRefs.current[tab.id] = el }}
                  onClick={function() { setActiveTab(tab.id) }}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    padding: '10px 22px',
                    backgroundColor: 'transparent',
                    color: isActive ? '#fff' : '#777',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </motion.div>
        </div>

        {/* Products Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="featured-products-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map(function(product) {
              return <ProductCard key={product.id} product={product} />
            })
          ) : (
            <div style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              padding: '50px 20px',
              color: '#aaa',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.02)',
              border: '1px dashed #e0e0e0',
            }}>
              <p style={{ fontSize: '16px', margin: '0 0 6px', fontWeight: 600 }}>No products found</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#bbb' }}>Try a different category above</p>
            </div>
          )}
        </motion.div>

        {/* "More products" indicator + View All CTA */}
        {filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px',
              marginTop: '36px',
            }}
          >
            {remainingCount > 0 && (
              <p style={{
                fontSize: '14px',
                color: '#999',
                margin: 0,
                fontWeight: 500,
                letterSpacing: '0.2px',
              }}>
                + {remainingCount} more product{remainingCount > 1 ? 's' : ''} in this collection
              </p>
            )}

            <Link
              href="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 36px',
                border: '2px solid #1a1a1a',
                color: '#1a1a1a',
                textDecoration: 'none',
                borderRadius: '60px',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
              onMouseEnter={function(e) {
                e.currentTarget.style.backgroundColor = '#1a1a1a'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={function(e) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#1a1a1a'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              View All Products
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>

      <style jsx>{
        "@media (max-width: 900px) { .featured-products-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 560px) { .featured-products-grid { grid-template-columns: 1fr !important; } }"
      }</style>
    </section>
  )
}
