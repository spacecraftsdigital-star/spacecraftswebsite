// Modern Category Grid Section - SEO Optimized
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 1,
    name: 'Sofas & Couches',
    slug: 'sofas-couches',
    image: '/category/sofas.webp',
    productCount: 45,
    tagline: 'Premium Comfort',
    accent: '#e67e22',
    imagePosition: 'center 40%',
  },
  {
    id: 2,
    name: 'Chairs & Seating',
    slug: 'chairs-seating',
    image: '/category/chairs.webp',
    productCount: 38,
    tagline: 'Refined Elegance',
    accent: '#3498db',
    imagePosition: 'center 35%',
  },
  {
    id: 3,
    name: 'Tables',
    slug: 'tables',
    image: '/category/tables.webp',
    productCount: 32,
    tagline: 'Gather in Style',
    accent: '#27ae60',
    imagePosition: 'center 45%',
  },
  {
    id: 4,
    name: 'Beds & Mattresses',
    slug: 'beds-frames',
    image: '/category/beds.webp',
    productCount: 28,
    tagline: 'Sleep in Luxury',
    accent: '#9b59b6',
    imagePosition: 'center 40%',
  },
  {
    id: 5,
    name: 'Dining Sets',
    slug: 'dining-room',
    image: '/category/diningsets.webp',
    productCount: 42,
    tagline: 'Cherish Every Meal',
    accent: '#e74c3c',
    imagePosition: 'center 45%',
  },
  {
    id: 6,
    name: 'Outdoor Living',
    slug: 'outdoor-furniture',
    image: '/category/outdoor.webp',
    productCount: 24,
    tagline: 'Embrace Nature',
    accent: '#1abc9c',
    imagePosition: 'center 40%',
  },
]

function CategoryCard({ category, index, isVisible }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={'/products?category=' + category.slug}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <article
          onMouseEnter={function() { setHovered(true) }}
          onMouseLeave={function() { setHovered(false) }}
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            height: '300px',
            cursor: 'pointer',
            transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: hovered
              ? '0 16px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)'
              : '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Image with smooth subtle zoom */}
          <div
            style={{
              position: 'absolute',
              top: '-2%',
              left: '-1%',
              width: '102%',
              height: '104%',
              transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              willChange: 'transform',
            }}
          >
            <Image
              src={category.image}
              alt={category.name + ' furniture collection'}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover', objectPosition: category.imagePosition || 'center center' }}
            />
          </div>

          {/* Light gradient overlay - subtle bottom fade */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 35%, transparent 45%, rgba(0,0,0,0.5) 100%)',
              transition: 'opacity 0.6s ease',
              opacity: hovered ? 0.85 : 1,
            }}
          />

          {/* Corner badge */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              zIndex: 4,
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.5px',
              transition: 'all 0.4s ease',
              opacity: hovered ? 1 : 0.7,
              transform: hovered ? 'translateY(0)' : 'translateY(-4px)',
            }}
          >
            {category.productCount}+ Items
          </div>

          {/* Bottom content */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              padding: '30px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Tagline */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                color: hovered ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.4s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                transform: hovered ? 'translateY(0)' : 'translateY(6px)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              {category.tagline}
            </span>

            {/* Category name */}
            <h3
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                letterSpacing: '-0.5px',
                lineHeight: 1.2,
                transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                transform: hovered ? 'translateY(0)' : 'translateY(4px)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              {category.name}
            </h3>

            {/* Explore link with arrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '6px',
                transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#fff',
                  letterSpacing: '0.5px',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                Explore Collection
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 0.35s ease',
                  transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            {/* Accent underline */}
            <div
              style={{
                width: hovered ? '60px' : '30px',
                height: '3px',
                borderRadius: '3px',
                backgroundColor: hovered ? '#fff' : category.accent,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                marginTop: '4px',
                opacity: hovered ? 0.9 : 0.6,
              }}
            />
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

export default function ModernCategoryGrid({ serverCategories = [] }) {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

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

  var categoryImageMap = {
    'sofas-couches': '/category/sofas.webp',
    'chairs': '/category/chairs.webp',
    'tables': '/category/tables.webp',
    'beds': '/category/beds.webp',
    'dining-sets': '/category/diningsets.webp',
    'outdoor-furniture': '/category/outdoor.webp',
    'living-room': '/category/sofas.webp',
    'bedroom': '/category/beds.webp',
    'storage-organization': '/category/tables.webp',
    'office-furniture': '/category/chairs.webp',
    'kids-furniture': '/category/beds.webp',
    'mattresses': '/category/beds.webp',
    'home-decor': '/category/sofas.webp',
    'tv-units-entertainment': '/category/tables.webp',
    'wardrobes-cabinets': '/category/beds.webp',
  }

  var accentMap = {
    'sofas-couches': '#e67e22',
    'chairs-seating': '#3498db',
    'tables': '#27ae60',
    'beds-frames': '#9b59b6',
    'dining-room': '#e74c3c',
    'outdoor-furniture': '#1abc9c',
  }

  var displayCategories =
    serverCategories.length > 0
      ? serverCategories.map(function(cat) {
          return {
            ...cat,
            image: categoryImageMap[cat.slug] || '/category/sofas.webp',
            productCount: 0,
            tagline: cat.name,
            accent: accentMap[cat.slug] || '#e67e22',
            imagePosition: 'center 40%',
          }
        })
      : categories

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '48px 20px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f7f4 100%)',
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
              marginBottom: '16px',
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
              Explore
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
              margin: '0 0 14px',
              letterSpacing: '-1.5px',
              lineHeight: 1.1,
            }}
          >
            Shop by Category
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '16px',
              color: '#888',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Curated collections for every room in your home
          </motion.p>
        </div>

        {/* Bento-style Grid */}
        <div
          className="category-bento-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto auto',
            gap: '20px',
          }}
        >
          {displayCategories.slice(0, 6).map(function(category, index) {
            return (
              <CategoryCard
                key={category.slug || category.id}
                category={category}
                index={index}
                isVisible={isVisible}
              />
            )
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ textAlign: 'center', marginTop: '40px' }}
        >
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 40px',
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
            View All Categories
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      </div>

      <style jsx>{
        "@media (max-width: 900px) { .category-bento-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 560px) { .category-bento-grid { grid-template-columns: 1fr !important; } }"
      }</style>
    </section>
  )
}
