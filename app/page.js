import { createSupabaseServerClient } from '../lib/supabaseClient'
import ModernHeroCarousel from '../components/ModernHeroCarousel'
import PromoBanners from '../components/PromoBanners'
import BankBanner from '../components/BankBanner'
import TrustBadges from '../components/TrustBadges'
import ModernCategoryGrid from '../components/ModernCategoryGrid'
import FeaturedProductsSection from '../components/FeaturedProductsSection'
import ShopAllThingsHome from '../components/ShopAllThingsHome'
import MoreIdeasSection from '../components/MoreIdeasSection'
import NewArrivalsGrid from '../components/NewArrivalsGrid'
import CustomerReviewsSection from '../components/CustomerReviewsSection'
import SpecialOfferBanner from '../components/SpecialOfferBanner'
import StoreLocatorSection from '../components/StoreLocatorSection'
import NeedHelpBuyingSection from '../components/NeedHelpBuyingSection'
import NewsletterSection from '../components/NewsletterSection'

// Force dynamic rendering — always fetch fresh data from Supabase
export const dynamic = 'force-dynamic'

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
  let bestsellers = []
  let offeredProducts = []
  let allProducts = []
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch ALL categories (needed by ShopAllThingsHome for slug→id mapping)
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
    
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
    
    // Fetch bestseller products (best_seller = true)
    const { data: bestsellerData } = await supabase
      .from('products')
      .select(`
        *,
        product_images (url, alt, position)
      `)
      .eq('is_active', true)
      .eq('best_seller', true)
      .order('rating', { ascending: false })
      .limit(20)

    // Fetch offered products (is_offered = true)
    const { data: offeredData } = await supabase
      .from('products')
      .select(`
        *,
        product_images (url, alt, position)
      `)
      .eq('is_active', true)
      .eq('is_offered', true)
      .order('rating', { ascending: false })
      .limit(20)

    // Fetch all active products for ShopAllThingsHome tabs (with category relation)
    const { data: allProds } = await supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        product_images (url, alt, position)
      `)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(80)
    
    categories = cats || []
    products = (prods || []).map(p => ({
      ...p,
      images: p.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || []
    }))
    bestsellers = (bestsellerData || []).map(p => ({
      ...p,
      images: p.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || []
    }))
    offeredProducts = (offeredData || []).map(p => ({
      ...p,
      images: p.product_images?.sort((a, b) => a.position - b.position).map(img => img.url) || []
    }))
    allProducts = (allProds || []).map(p => ({
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

        {/* Promo Banners — Coupon + Offer Cards */}
        <PromoBanners />

        {/* Bank Offer Banner + Ticker */}
        <BankBanner />

        {/* Trust Badges / Benefits */}
        {/* <TrustBadges /> */}

        {/* Categories Section */}
        <ModernCategoryGrid serverCategories={categories} />

        {/* Shop All Things Home — Tag-based Tabs */}
        <ShopAllThingsHome products={allProducts} />

        {/* Featured Products — Bestsellers & Offers */}
        <FeaturedProductsSection bestsellers={bestsellers} offered={offeredProducts} />

        {/* More Ideas & Inspiration — Editorial Masonry Grid */}
        <MoreIdeasSection />

        {/* New Arrivals — 3-Column Feature Grid */}
        <NewArrivalsGrid />

        {/* Customer Reviews — Google Reviews Showcase */}
        <CustomerReviewsSection />

        {/* Special Offer Banner */}
        <SpecialOfferBanner />

        {/* Store Locator */}
        {/* <StoreLocatorSection /> */}

        {/* Help Section */}
        {/* <NeedHelpBuyingSection /> */}

        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
    </>
  )
}
