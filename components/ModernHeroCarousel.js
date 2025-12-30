// Modern Hero Section with Image Carousel
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const heroSlides = [
  {
    id: 1,
    title: 'Transform Your Space',
    subtitle: 'Premium Furniture for Modern Living',
    description: 'Discover our curated collection of designer furniture',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80',
    cta: 'Shop Collection',
    ctaLink: '/products',
    bgColor: '#f5f1e8'
  },
  {
    id: 2,
    title: 'Comfort Meets Style',
    subtitle: 'Luxury Sofas & Seating',
    description: 'Up to 40% off on selected items',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80',
    cta: 'View Deals',
    ctaLink: '/products?category=sofas-couches',
    bgColor: '#e8f1f5'
  },
  {
    id: 3,
    title: 'Dream Bedroom',
    subtitle: 'Create Your Perfect Sanctuary',
    description: 'New arrivals in bedroom furniture',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1920&q=80',
    cta: 'Explore Bedroom',
    ctaLink: '/products?category=bedroom',
    bgColor: '#f5e8f1'
  }
]

export default function ModernHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section className="hero-carousel" style={{ position: 'relative', overflow: 'hidden', minHeight: '500px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="hero-slide"
          style={{
            backgroundColor: heroSlides[currentSlide].bgColor,
            padding: '80px 20px',
            minHeight: '500px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div className="hero-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
              
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hero-text"
              >
                <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '10px' }}>
                  {heroSlides[currentSlide].subtitle}
                </p>
                <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.2', color: '#1a1a1a' }}>
                  {heroSlides[currentSlide].title}
                </h1>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px', lineHeight: '1.6' }}>
                  {heroSlides[currentSlide].description}
                </p>
                <Link 
                  href={heroSlides[currentSlide].ctaLink}
                  style={{
                    display: 'inline-block',
                    padding: '16px 40px',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: '2px solid #1a1a1a'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                    e.target.style.color = '#1a1a1a'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1a1a1a'
                    e.target.style.color = '#fff'
                  }}
                >
                  {heroSlides[currentSlide].cta}
                </Link>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="hero-image"
                style={{ position: 'relative', height: '400px' }}
              >
                <Image
                  src={heroSlides[currentSlide].image}
                  alt={heroSlides[currentSlide].title}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 10 }}>
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: currentSlide === index ? '40px' : '12px',
              height: '12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: currentSlide === index ? '#1a1a1a' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-text h1 {
            font-size: 32px !important;
          }
          .hero-image {
            height: 300px !important;
          }
        }
      `}</style>
    </section>
  )
}
