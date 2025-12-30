// Featured Products Section
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ProductCard from './ProductCard'

const tabs = [
  { id: 'bestsellers', label: 'Bestsellers', filter: (p) => p.tags?.includes('bestseller') },
  { id: 'new-arrivals', label: 'New Arrivals', filter: (p) => true },
  { id: 'trending', label: 'Trending', filter: (p) => p.tags?.includes('trending') },
  { id: 'on-sale', label: 'On Sale', filter: (p) => p.discount_price > 0 }
]

export default function FeaturedProductsSection({ products = [] }) {
  const [activeTab, setActiveTab] = useState('bestsellers')
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const filteredProducts = products
    .filter(tabs.find(t => t.id === activeTab)?.filter || (() => true))
    .slice(0, 8)

  return (
    <section 
      ref={ref}
      className="featured-products-section" 
      style={{ padding: '80px 20px', backgroundColor: '#f9f9f9' }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ 
              fontSize: '14px', 
              textTransform: 'uppercase', 
              letterSpacing: '2px', 
              color: '#888',
              marginBottom: '10px'
            }}
          >
            HANDPICKED FOR YOU
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ 
              fontSize: '42px', 
              fontWeight: '700', 
              color: '#1a1a1a',
              marginBottom: '30px'
            }}
          >
            Featured Products
          </motion.h2>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#666',
                  border: activeTab === tab.id ? '2px solid #1a1a1a' : '2px solid #ddd',
                  borderRadius: '25px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.borderColor = '#1a1a1a'
                    e.target.style.color = '#1a1a1a'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.borderColor = '#ddd'
                    e.target.style.color = '#666'
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Products Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px'
          }}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <p style={{ fontSize: '18px' }}>No products found in this category</p>
            </div>
          )}
        </motion.div>

        {/* View All Button */}
        {filteredProducts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <a
              href="/products"
              style={{
                display: 'inline-block',
                padding: '14px 35px',
                border: '2px solid #1a1a1a',
                color: '#1a1a1a',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1a1a1a'
                e.target.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#1a1a1a'
              }}
            >
              View All Products
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .featured-products-section h2 {
            font-size: 32px !important;
          }
          .featured-products-section .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
          }
        }
      `}</style>
    </section>
  )
}
