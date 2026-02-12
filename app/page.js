import { createSupabaseServerClient } from '../lib/supabaseClient'
import ModernHeroCarousel from '../components/ModernHeroCarousel'
import TrustBadges from '../components/TrustBadges'
import ModernCategoryGrid from '../components/ModernCategoryGrid'
import FeaturedProductsSection from '../components/FeaturedProductsSection'
import SpecialOfferBanner from '../components/SpecialOfferBanner'
import StoreLocatorSection from '../components/StoreLocatorSection'
import NeedHelpBuyingSection from '../components/NeedHelpBuyingSection'

// SEO Metadata
export const metadata = {
  title: 'Spacecrafts Furniture - Premium Furniture Store | Sofas, Beds, Dining Sets & More',
  description: 'Shop premium furniture online at Spacecrafts Furniture. Wide selection of sofas, beds, dining sets, office furniture, and home decor. Free delivery across India. Best prices guaranteed.',
  keywords: 'furniture store, online furniture shopping, sofas, beds, dining sets, office furniture, home decor, furniture India, premium furniture',
  openGraph: {
    title: 'Spacecrafts Furniture - Premium Furniture Store',
    description: 'Shop premium furniture online. Wide selection, best prices, free delivery across India.',
    url: 'https://spacecraftsfurniture.com',
    siteName: 'Spacecrafts Furniture',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spacecrafts Furniture - Premium Furniture Store',
    description: 'Shop premium furniture online. Wide selection, best prices, free delivery.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://spacecraftsfurniture.com'
  }
}

export default async function Home() {
  // Server-side data fetching for better SEO
  let categories = []
  let products = []
  let featuredProducts = []
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch categories with product count
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .limit(12)
    
    // Fetch latest products
    const { data: prods } = await supabase
      .from('products')
      .select(`
        *,
        product_images (url, alt, position)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)
    
    // Fetch featured/bestselling products
    const { data: featured } = await supabase
      .from('products')
      .select(`
        *,
        product_images (url, alt, position)
      `)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false })
      .limit(16)
    
    categories = cats || []
    products = (prods || []).map(p => ({
      ...p,
      images: p.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || []
    }))
    featuredProducts = (featured || []).map(p => ({
      ...p,
      images: p.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || []
    }))
  } catch (e) {
    console.warn('Supabase not configured for server fetch in Home:', e.message)
  }

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'Spacecrafts Furniture',
    description: 'Premium furniture store offering sofas, beds, dining sets, office furniture and home decor',
    url: 'https://spacecraftsfurniture.com',
    logo: 'https://spacecraftsfurniture.com/logo.png',
    image: 'https://spacecraftsfurniture.com/og-image.jpg',
    telephone: '+91-80-25123456',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '45 MG Road, Ashok Nagar',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560001',
      addressCountry: 'IN'
    },
    priceRange: '₹₹₹',
    openingHours: 'Mo-Su 10:00-21:00',
    sameAs: [
      'https://www.facebook.com/spacecraftsfurniture',
      'https://www.instagram.com/spacecraftsfurniture',
      'https://twitter.com/spacecraftsfurn'
    ]
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        {/* Hero Section */}
        <ModernHeroCarousel />

        {/* Trust Badges / Benefits */}
        <TrustBadges />

        {/* Categories Section */}
        <ModernCategoryGrid serverCategories={categories} />

        {/* Featured Products */}
        <FeaturedProductsSection products={featuredProducts} />

        {/* Special Offer Banner */}
        <SpecialOfferBanner />

        {/* Store Locator */}
        <StoreLocatorSection />

        {/* Help Section */}
        <NeedHelpBuyingSection />

        {/* Newsletter Section */}
        <section style={{ padding: '48px 20px', backgroundColor: '#f5f1e8' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px' }}>
              Join Our Newsletter
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
              Get exclusive offers, design tips, and new arrival updates delivered to your inbox
            </p>
            <form style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
              <input
                type="email"
                placeholder="Enter your email"
                required
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '15px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '14px 30px',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
