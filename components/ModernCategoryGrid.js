// Modern Category Grid Section - SEO Optimized
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const categories = [
  {
    id: 1,
    name: 'Sofas & Couches',
    slug: 'sofas-couches',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    productCount: 45,
    description: 'Premium comfort seating'
  },
  {
    id: 2,
    name: 'Beds & Mattresses',
    slug: 'beds-frames',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    productCount: 38,
    description: 'Sleep in luxury'
  },
  {
    id: 3,
    name: 'Dining Sets',
    slug: 'dining-room',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    productCount: 32,
    description: 'Gather in style'
  },
  {
    id: 4,
    name: 'Office Furniture',
    slug: 'office-furniture',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    productCount: 28,
    description: 'Work from home essentials'
  },
  {
    id: 5,
    name: 'Storage Solutions',
    slug: 'storage-organization',
    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    productCount: 42,
    description: 'Organize beautifully'
  },
  {
    id: 6,
    name: 'Outdoor Living',
    slug: 'outdoor-furniture',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    productCount: 24,
    description: 'Embrace nature'
  }
]

export default function ModernCategoryGrid({ serverCategories = [] }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  // Map category slugs to Unsplash images
  const categoryImageMap = {
    'living-room': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'bedroom': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'dining-room': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
    'office-furniture': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    'outdoor-furniture': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
    'storage-organization': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80',
    'sofas-couches': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'beds-frames': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
    'tables': 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=800&q=80',
    'chairs-seating': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    'kids-furniture': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
    'mattresses': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'home-decor': 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    'tv-units-entertainment': 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80',
    'wardrobes-cabinets': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'
  }

  const displayCategories = serverCategories.length > 0 
    ? serverCategories.map(cat => ({
        ...cat,
        image: categoryImageMap[cat.slug] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        productCount: 0,
        description: cat.name
      }))
    : categories

  return (
    <section 
      ref={ref}
      className="category-grid-section" 
      style={{ padding: '80px 20px', backgroundColor: '#fff' }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
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
            EXPLORE BY CATEGORY
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ 
              fontSize: '42px', 
              fontWeight: '700', 
              color: '#1a1a1a',
              marginBottom: '15px'
            }}
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}
          >
            Find the perfect furniture pieces for every room in your home
          </motion.p>
        </div>

        {/* Category Cards Grid */}
        <div 
          className="category-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px' 
          }}
        >
          {displayCategories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.slug || category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                href={`/products?category=${category.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <article 
                  className="category-card"
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                    height: '320px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <Image
                      src={category.image}
                      alt={`${category.name} furniture collection`}
                      fill
                      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="category-image"
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)'
                    }} />
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ 
                      fontSize: '22px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: '#1a1a1a'
                    }}>
                      {category.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>
                      {category.description}
                    </p>
                    {category.productCount > 0 && (
                      <p style={{ fontSize: '13px', color: '#666' }}>
                        {category.productCount}+ Products
                      </p>
                    )}
                  </div>

                  {/* Hover Arrow */}
                  <div 
                    className="hover-arrow"
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      right: '20px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#1a1a1a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '18px',
                      opacity: 0,
                      transform: 'translateX(-10px)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    →
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link
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
            View All Categories
          </Link>
        </div>
      </div>

      <style jsx>{`
        .category-card:hover .category-image {
          transform: scale(1.08);
        }
        .category-card:hover .hover-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
          }
        }
      `}</style>
    </section>
  )
}
