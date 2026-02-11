// Modern Hero Carousel — Fully Rewritten
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDE_DURATION = 6000 // ms per slide

const heroSlides = [
  {
    id: 1,
    title: 'Transform Your Space',
    subtitle: 'Premium Furniture for Modern Living',
    description: 'Discover our curated collection of designer furniture that blends elegance with everyday comfort.',
    // Old: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80'
    image: '/hero/11.jpg',
    cta: 'Shop Collection',
    ctaLink: '/products',
    gradient: 'linear-gradient(135deg, rgba(26,26,26,0.82) 0%, rgba(26,26,26,0.45) 50%, rgba(0,0,0,0.1) 100%)',
    accent: '#e67e22'
  },
  {
    id: 2,
    title: 'Comfort Meets Style',
    subtitle: 'Luxury Sofas & Seating',
    description: 'Up to 40% off on selected premium sofas — sink into luxury without the premium price tag.',
    // Old: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80'
    image: '/hero/2.jpg',
    cta: 'View Deals',
    ctaLink: '/products?category=sofas-couches',
    gradient: 'linear-gradient(135deg, rgba(15,32,45,0.85) 0%, rgba(15,32,45,0.4) 50%, rgba(0,0,0,0.05) 100%)',
    accent: '#3498db'
  },
  {
    id: 3,
    title: 'Dream Bedroom',
    subtitle: 'Create Your Perfect Sanctuary',
    description: 'New arrivals in bedroom furniture — crafted for restful nights and beautiful mornings.',
    // Old: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1920&q=80'
    image: '/hero/1.jpg',
    cta: 'Explore Bedroom',
    ctaLink: '/products?category=bedroom',
    gradient: 'linear-gradient(135deg, rgba(45,20,35,0.85) 0%, rgba(45,20,35,0.4) 50%, rgba(0,0,0,0.05) 100%)',
    accent: '#e74c3c'
  }
]

export default function ModernHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  // --- Auto-play with progress bar ---
  useEffect(() => {
    if (!isAutoPlaying) {
      setProgress(0)
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
      return
    }
    startTimeRef.current = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        setDirection(1)
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        startTimeRef.current = Date.now()
      }
      progressRef.current = requestAnimationFrame(tick)
    }
    progressRef.current = requestAnimationFrame(tick)
    return () => { if (progressRef.current) cancelAnimationFrame(progressRef.current) }
  }, [isAutoPlaying, currentSlide])

  const goToSlide = useCallback((index) => {
    if (index === currentSlide) return
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [currentSlide])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const slide = heroSlides[currentSlide]

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '92vh',
        minHeight: '520px',
        maxHeight: '820px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Full-bleed slides */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, scale: 1.05, x: direction > 0 ? 60 : -60 }}
          animate={{ opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, scale: 0.97, x: direction > 0 ? -60 : 60, transition: { duration: 0.5, ease: 'easeIn' } }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {/* Background Image with Ken Burns */}
          <motion.div
            key={`bg-${slide.id}`}
            initial={{ scale: 1 }}
            animate={{ scale: 1.08, transition: { duration: SLIDE_DURATION / 1000 + 1, ease: 'linear' } }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              willChange: 'transform',
            }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              sizes="100vw"
              quality={90}
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
            />
          </motion.div>

          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1,
              background: slide.gradient,
            }}
          />

          {/* Decorative accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '5px',
              height: '100%',
              zIndex: 3,
              background: slide.accent,
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 60px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
              }}
              style={{ maxWidth: '600px' }}
            >
              {/* Subtitle */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  color: 'rgba(255,255,255,0.75)',
                  margin: '0 0 18px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '28px',
                    height: '2px',
                    borderRadius: '1px',
                    flexShrink: 0,
                    backgroundColor: slide.accent,
                  }}
                />
                {slide.subtitle}
              </motion.p>

              {/* Title */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                style={{
                  fontSize: '58px',
                  fontWeight: 800,
                  lineHeight: 1.08,
                  color: '#fff',
                  margin: '0 0 20px',
                  letterSpacing: '-1px',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {slide.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                className="hero-desc-text"
                variants={{
                  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                style={{
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.78)',
                  margin: '0 0 36px',
                  maxWidth: '480px',
                }}
              >
                {slide.description}
              </motion.p>

              {/* CTA Button */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <Link
                  href={slide.ctaLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '16px 38px',
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: '#fff',
                    background: slide.accent,
                    borderRadius: '6px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    letterSpacing: '0.3px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)'
                    e.currentTarget.style.filter = 'brightness(1.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)'
                    e.currentTarget.style.filter = 'brightness(1)'
                  }}
                >
                  {slide.cta}
                  <span style={{ display: 'inline-block', fontSize: '18px', transition: 'transform 0.3s ease' }}>&#8594;</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        className="hero-nav-arrow"
        onClick={goPrev}
        aria-label="Previous slide"
        style={{
          position: 'absolute',
          top: '50%',
          left: '24px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          e.currentTarget.style.transform = 'translateY(-50%)'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button
        className="hero-nav-arrow"
        onClick={goNext}
        aria-label="Next slide"
        style={{
          position: 'absolute',
          top: '50%',
          right: '24px',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.18)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          e.currentTarget.style.transform = 'translateY(-50%)'
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
      </button>

      {/* Bottom bar: indicators + progress */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '60px',
          right: '60px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                position: 'relative',
                width: currentSlide === i ? '64px' : '44px',
                height: '4px',
                borderRadius: '2px',
                border: 'none',
                background: currentSlide === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'width 0.4s ease, background 0.3s ease',
                padding: 0,
              }}
            >
              {currentSlide === i && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${progress}%`,
                    borderRadius: '2px',
                    backgroundColor: slide.accent,
                    transition: 'width 0.05s linear',
                  }}
                />
              )}
            </button>
          ))}
        </div>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '2px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {String(currentSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
        </span>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-nav-arrow {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .hero-desc-text {
            display: none !important;
          }
        }
      `}</style>
    </section>
  )
}
