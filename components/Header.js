"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '../lib/authenticatedFetch'

export default function Header() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [closeTimeout, setCloseTimeout] = useState(null)
  const [openTimeout, setOpenTimeout] = useState(null)
  
  const { user, profile, isAuthenticated, signOut, loading } = useAuth()
  const router = useRouter()
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)
  const navBarRef = useRef(null)

  // Category Navigation Data
  const categoryData = {
    ALL: {
      sections: [
        {
          title: 'BEDS',
          items: [
            { name: 'Bunk Beds', slug: 'bunk-beds' },
            { name: 'Futon Beds', slug: 'futon-beds' },
            { name: 'Diwan Cum Beds', slug: 'diwan-cum-beds' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'Metal Cots', slug: 'metal-cots' },
            { name: 'Recliner Folding Beds', slug: 'recliner-folding-beds' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' },
            { name: 'Wooden Beds', slug: 'wooden-beds' }
          ]
        },
        {
          title: 'CHAIRS',
          items: [
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Lazy Chairs', slug: 'lazy-chairs' },
            { name: 'Office Chairs', slug: 'office-chairs' },
            { name: 'Relax Chair', slug: 'relax-chair' },
            { name: 'Rocking Chairs', slug: 'rocking-chairs' },
            { name: 'Study Chair', slug: 'study-chair' }
          ]
        },
        {
          title: 'DINING SETS',
          items: [
            { name: 'Dining Tables', slug: 'dining-tables' },
            { name: 'Dining Chairs', slug: 'dining-chairs' },
            { name: 'Folding Dinings', slug: 'folding-dinings' },
            { name: 'Shoe Racks', slug: 'shoe-racks' }
          ]
        },
        {
          title: 'SOFA SETS',
          items: [
            { name: '2 Seater', slug: '2-seater' },
            { name: '3+1+1 Sofas', slug: '3-1-1-sofas' },
            { name: 'Corner Sofas', slug: 'corner-sofas' },
            { name: 'Cushion Sofas', slug: 'cushion-sofas' },
            { name: 'Diwans', slug: 'diwans' },
            { name: 'Recliner Sofas', slug: 'recliner-sofas' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' }
          ]
        },
        {
          title: 'SPACE SAVING',
          items: [
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'TV Racks', slug: 'tv-racks' }
          ]
        },
        {
          title: 'TABLES',
          items: [
            { name: 'Coffee Tables', slug: 'coffee-tables' },
            { name: 'Dressing Tables', slug: 'dressing-tables' },
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Study & Office Tables', slug: 'study-office-tables' }
          ]
        },
        {
          title: 'WARDROBES & RACKS',
          items: [
            { name: 'Wardrobes', slug: 'wardrobes' },
            { name: 'Book Shelves', slug: 'book-shelves' },
            { name: 'Shoe Racks', slug: 'shoe-racks' },
            { name: 'TV Racks', slug: 'tv-racks' }
          ]
        }
      ],
      images: ['/header/All.jpg']
    },
    'SPACE SAVING FURNITURE': {
      sections: [
        {
          title: 'SPACE SAVERS',
          items: [
            { name: 'Bunk Beds', slug: 'bunk-beds' },
            { name: 'Diwan Cum Beds', slug: 'diwan-cum-beds' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'Recliner Folding Beds', slug: 'recliner-folding-beds' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' },
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Study & Office Tables', slug: 'study-office-tables' },
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Lazy Chairs', slug: 'lazy-chairs' },
            { name: 'Relax Chair', slug: 'relax-chair' },
            { name: 'Study Chair', slug: 'study-chair' },
            { name: 'Folding Dinings', slug: 'folding-dinings' }
          ]
        }
      ],
      images: ['/header/spacesavingfurniture.webp']
    },
    'BEDS': {
      sections: [
        {
          title: 'ALL BEDS',
          items: [
            { name: 'Bunk Beds', slug: 'bunk-beds' },
            { name: 'Futon Beds', slug: 'futon-beds' },
            { name: 'Diwan Cum Beds', slug: 'diwan-cum-beds' },
            { name: 'Folding Beds', slug: 'folding-beds' },
            { name: 'Metal Cots', slug: 'metal-cots' },
            { name: 'Recliner Folding Beds', slug: 'recliner-folding-beds' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' },
            { name: 'Wooden Beds', slug: 'wooden-beds' }
          ]
        }
      ],
      images: ['/header/beds.webp']
    },
    'CHAIRS': {
      sections: [
        {
          title: 'ALL CHAIRS',
          items: [
            { name: 'Foldable Chairs', slug: 'foldable-chairs' },
            { name: 'Lazy Chairs', slug: 'lazy-chairs' },
            { name: 'Office Chairs', slug: 'office-chairs' },
            { name: 'Relax Chair', slug: 'relax-chair' },
            { name: 'Rocking Chairs', slug: 'rocking-chairs' },
            { name: 'Study Chair', slug: 'study-chair' }
          ]
        }
      ],
      images: ['/header/chairs.webp']
    },
    'DINING SETS': {
      sections: [
        {
          title: 'DINING',
          items: [
            { name: 'Shoe Racks', slug: 'shoe-racks' },
            { name: 'Dining Tables', slug: 'dining-tables' },
            { name: 'Dining Chairs', slug: 'dining-chairs' }
          ]
        }
      ],
      images: ['/header/diningsets.webp']
    },
    'SOFA SETS': {
      sections: [
        {
          title: 'SOFAS',
          items: [
            { name: '2 Seater', slug: '2-seater' },
            { name: '3+1+1 Sofas', slug: '3-1-1-sofas' },
            { name: 'Corner Sofas', slug: 'corner-sofas' },
            { name: 'Cushion Sofas', slug: 'cushion-sofas' },
            { name: 'Diwans', slug: 'diwans' },
            { name: 'Recliner Sofas', slug: 'recliner-sofas' },
            { name: 'Sofa cum Beds', slug: 'sofa-cum-beds' }
          ]
        }
      ],
      images: ['/header/sofasets.webp']
    },
    'TABLES': {
      sections: [
        {
          title: 'TABLES',
          items: [
            { name: 'Dressing Tables', slug: 'dressing-tables' },
            { name: 'Foldable Tables', slug: 'foldable-tables' },
            { name: 'Study & Office Tables', slug: 'study-office-tables' },
            { name: 'Coffee Tables', slug: 'coffee-tables' }
          ]
        }
      ],
      images: ['/header/tables.webp']
    },
    'WARDROBE & RACKS': {
      sections: [
        {
          title: 'STORAGE',
          items: [
            { name: 'Book Racks', slug: 'book-racks' },
            { name: 'Shoe Racks', slug: 'shoe-racks' },
            { name: 'TV Racks', slug: 'tv-racks' },
            { name: 'Wardrobes', slug: 'wardrobes' }
          ]
        }
      ],
      images: ['/header/wardrobe.webp']
    }
  }

  const categories = Object.keys(categoryData)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Account'

  // Fetch cart count
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount()
    } else {
      setCartCount(0)
    }
  }, [isAuthenticated])

  const fetchCartCount = async () => {
    try {
      const res = await authenticatedFetch('/api/cart/get')
      if (res.ok) {
        const data = await res.json()
        setCartCount(data.items?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.results || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle nav area hover - only close when leaving the entire nav section
  const handleNavMouseLeave = () => {
    if (openTimeout) { clearTimeout(openTimeout); setOpenTimeout(null) }
    const timeout = setTimeout(() => setHoveredCategory(null), 300)
    setCloseTimeout(timeout)
  }

  const handleNavMouseEnter = () => {
    if (closeTimeout) clearTimeout(closeTimeout)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`)
      setShowResults(false)
      setQuery('')
    }
  }

  const handleProductClick = (slug) => {
    setShowResults(false)
    setQuery('')
    router.push(`/products/${slug}`)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
    router.push('/')
  }

  return (
    <>
      <header className="site-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo">
            <Link href="/">
              <Image src="/logo.webp" alt="Spacecrafts Furniture" width={160} height={60} priority style={{ height: 'auto', width: 'auto' }} />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="header-search" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for furniture, categories, brands..."
                className="search-input"
                aria-label="Search products"
              />
              <button type="submit" className="search-button" aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="search-results">
                {isSearching ? (
                  <div className="search-loading">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="search-result-item"
                        onClick={() => handleProductClick(product.slug)}
                      >
                        <div className="result-image">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={50}
                              height={50}
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="result-no-image">No image</div>
                          )}
                        </div>
                        <div className="result-info">
                          <div className="result-name">{product.name}</div>
                          <div className="result-price">₹{product.price.toLocaleString()}</div>
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="result-badge">Only {product.stock} left</span>
                        )}
                      </div>
                    ))}
                    <button 
                      className="search-view-all"
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(query)}`)
                        setShowResults(false)
                        setQuery('')
                      }}
                    >
                      View all results
                    </button>
                  </>
                ) : (
                  <div className="search-empty">No products found</div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="header-nav">
            <Link href="/products" className="nav-link">Furniture</Link>
            <Link href="/store-locator" className="nav-link">Stores</Link>
            <Link href="/wishlist" className="nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span className="nav-text">Wishlist</span>
            </Link>
            <Link href="/cart" className="nav-link cart-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span className="nav-text">Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>

          {/* User Menu */}
          <div className="header-user" ref={userMenuRef}>
            {loading ? (
              <div className="user-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                <button 
                  className="user-button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{displayName}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link href="/account" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      My Account
                    </Link>
                    <Link href="/orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      My Orders
                    </Link>
                    <button className="dropdown-item" onClick={handleSignOut}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/login" className="login-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Category Navigation Bar */}
        <nav 
          className="category-nav" 
          ref={navBarRef}
          onMouseEnter={handleNavMouseEnter}
          onMouseLeave={handleNavMouseLeave}
        >
          {categories.map((category) => (
            <div
              key={category}
              className="category-nav-item"
              onMouseEnter={() => {
                if (closeTimeout) clearTimeout(closeTimeout)
                if (openTimeout) clearTimeout(openTimeout)
                // If already showing a dropdown, switch instantly; otherwise delay 250ms
                if (hoveredCategory) {
                  setHoveredCategory(category)
                } else {
                  const t = setTimeout(() => setHoveredCategory(category), 500)
                  setOpenTimeout(t)
                }
              }}
            >
              <button className="category-nav-link">
                {category}
              </button>

              {/* Dropdown Menu */}
              {hoveredCategory === category && (
                <div className="category-dropdown">
                  {category === 'ALL' ? (
                    <div className="dropdown-content">
                      <div className="dropdown-left dropdown-left-all">
                        {categoryData[category].sections.map((section, idx) => (
                          <div key={idx} className="dropdown-section">
                            <h4 className="section-title">{section.title}</h4>
                            <ul className="section-items">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <button
                                    className="section-item-link"
                                    onClick={() => router.push(`/products?category=${item.slug}`)}
                                  >
                                    {item.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="dropdown-right dropdown-right-all">
                        <div className="category-images">
                          <div className="category-image-wrapper">
                            <Image
                              src={categoryData[category].images[0]}
                              alt={`${category} featured`}
                              width={380}
                              height={500}
                              style={{ objectFit: 'cover', objectPosition: 'center center', width: '100%', height: '100%' }}
                            />
                            <div className="image-overlay-text image-overlay-all">
                              <span className="overlay-label">Explore</span>
                              <span className="overlay-category">ALL FURNITURE</span>
                              <button className="overlay-cta" onClick={() => router.push('/products')}>
                                Shop Now
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="dropdown-content">
                      <div className="dropdown-accent-bar"></div>
                      <div className="dropdown-inner">
                        <div className="dropdown-left">
                          {categoryData[category].sections.map((section, idx) => (
                            <div key={idx} className="dropdown-section">
                              <h4 className="section-title">{section.title}</h4>
                              <ul className="section-items">
                                {section.items.map((item, itemIdx) => (
                                  <li key={itemIdx}>
                                    <button
                                      className="section-item-link"
                                      onClick={() => router.push(`/products?category=${item.slug}`)}
                                    >
                                      {item.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                              <button
                                className="shop-all-link"
                                onClick={() => router.push(`/products?category=${category.toLowerCase().replace(/\s+/g, '-')}`)}
                              >
                                Shop All {category}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14"/>
                                  <path d="m12 5 7 7-7 7"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="dropdown-right">
                          <div className="category-images">
                            <div className="category-image-wrapper">
                              <Image
                                src={categoryData[category].images[0]}
                                alt={`${category} featured`}
                                width={400}
                                height={500}
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                              <div className="image-overlay-text">
                                <span className="overlay-label">Explore</span>
                                <span className="overlay-category">{category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link href="/products" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Furniture
            </Link>
            <Link href="/store-locator" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Stores
            </Link>
            <Link href="/wishlist" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Wishlist
            </Link>
            <Link href="/cart" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/account" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                  My Account
                </Link>
                <Link href="/orders" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                  My Orders
                </Link>
                <button className="mobile-menu-item" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </header>

      <style jsx>{`
        .site-header {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0;
          border-bottom: 1px solid #f0f0f0;
          font-family: 'Inter', sans-serif;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1rem 2rem;
        }

        .header-logo {
          flex-shrink: 0;
          flex: 1;
          display: flex;
          justify-content: center;
          order: 2;
        }

        .header-logo a {
          display: block;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-logo img {
          max-height: 50px;
          width: auto;
          object-fit: contain;
        }

        /* Search */
        .header-search {
          flex: 1;
          max-width: 400px;
          position: relative;
          order: 1;
        }

        .search-form {
          display: flex;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e0e0e0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .search-form:focus-within {
          border-color: #e74c3c;
          background: white;
          box-shadow: 0 4px 16px rgba(231, 76, 60, 0.12);
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 0.9rem 1.25rem;
          font-size: 0.95rem;
          outline: none;
          background: transparent;
          color: #333;
        }

        .search-input::placeholder {
          color: #aaa;
          font-weight: 500;
        }

        .search-button {
          background: none;
          border: none;
          padding: 0 1.25rem;
          cursor: pointer;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s ease;
        }

        .search-button:hover {
          color: #e74c3c;
        }

        /* Search Results Dropdown */
        .search-results {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          max-height: 500px;
          overflow-y: auto;
          z-index: 100;
          border: 1px solid #e5e5e5;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.2s;
        }

        .search-result-item:hover {
          background: #f9f9f9;
        }

        .result-image {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f0f0f0;
        }

        .result-no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #ccc;
        }

        .result-info {
          flex: 1;
        }

        .result-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }

        .result-price {
          color: #666;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .result-badge {
          background: #ff6b6b;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          white-space: nowrap;
        }

        .search-loading, .search-empty {
          padding: 2rem;
          text-align: center;
          color: #999;
        }

        .search-view-all {
          width: 100%;
          padding: 0.75rem;
          background: #f5f5f5;
          color: #333;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          border-top: 1px solid #e5e5e5;
        }

        .search-view-all:hover {
          background: #ececec;
        }

        /* Navigation */
        .header-nav {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          order: 3;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          transition: all 0.2s;
          position: relative;
        }

        .nav-link:hover {
          background: #f5f5f5;
          color: #000;
        }

        .nav-text {
          font-size: 0.95rem;
        }

        .cart-link {
          position: relative;
        }

        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff6b6b;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        /* User Menu */
        .header-user {
          position: relative;
          flex-shrink: 0;
          order: 3;
        }

        .user-loading {
          padding: 0.5rem;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #e5e5e5;
          border-top-color: #333;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f5f5f5;
          border: 1px solid #e5e5e5;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-button:hover {
          background: #ececec;
          border-color: #d5d5d5;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #333;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .user-name {
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.75rem);
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          min-width: 240px;
          overflow: hidden;
          z-index: 100;
          border: 1px solid #e8e8e8;
          display: flex;
          flex-direction: column;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.95rem 1.25rem;
          color: #333;
          text-decoration: none;
          background: white;
          border: none;
          border-left: 3px solid transparent;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dropdown-item:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }

        .dropdown-item:hover {
          background: #f8f8f8;
          color: #000;
          border-left-color: #333;
          padding-left: 1.35rem;
        }

        .dropdown-item svg {
          color: #888;
          flex-shrink: 0;
          width: 18px;
          height: 18px;
        }

        .dropdown-item:hover svg {
          color: #333;
        }

        .login-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #333;
          color: white;
          text-decoration: none;
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .login-button:hover {
          background: #000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Mobile Menu */
        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #333;
          font-size: 1.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          order: 3;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 1024px) {
          .header-nav {
            gap: 1rem;
          }

          .nav-text {
            display: none;
          }

          .user-name {
            display: none;
          }

          .header-search {
            max-width: 350px;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;
          }

          .header-logo {
            order: 2;
            flex: none;
            width: 100%;
            justify-content: center;
          }

          .header-logo img {
            max-height: 45px;
          }

          .mobile-menu-toggle {
            display: block;
            order: 1;
            margin-left: auto;
          }

          .header-search {
            order: 3;
            width: 100%;
            max-width: none;
            flex: 1;
          }

          .header-nav, .header-user {
            display: none;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            background: #f9f9f9;
            border-top: 1px solid #e5e5e5;
          }

          .mobile-menu-item {
            color: #333;
            text-decoration: none;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            transition: all 0.2s;
            background: none;
            border: none;
            text-align: left;
            font-size: 1rem;
            cursor: pointer;
            width: 100%;
          }

          .mobile-menu-item:hover {
            background: #f0f0f0;
          }
        }

        /* Category Navigation Bar */
        .category-nav {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-bottom: 2px solid #1a252f;
          display: flex;
          justify-content: center;
          gap: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          position: relative;
        }

        .category-nav-item {
          display: flex;
        }

        .category-nav-link {
          color: #ecf0f1;
          background: transparent;
          border: none;
          padding: 0.95rem 1.8rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.3px;
          position: relative;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .category-nav-link::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e74c3c, #e67e22);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .category-nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .category-nav-link:hover::before {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Category Dropdown */
        .category-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          width: 100%;
          background: #ffffff;
          border: none;
          border-top: 3px solid transparent;
          border-image: linear-gradient(90deg, #e74c3c, #e67e22, #f39c12) 1;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.2), 0 8px 32px rgba(0, 0, 0, 0.08);
          border-radius: 0;
          max-width: none;
          max-height: 580px;
          overflow: visible;
          z-index: 1001;
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: normal;
          display: flex;
          justify-content: center;
          box-sizing: border-box;
          padding: 0 2rem;
          font-family: 'Inter', sans-serif;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-content {
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 1400px;
          min-height: 400px;
          max-height: 580px;
          box-sizing: border-box;
          position: relative;
        }

        .dropdown-inner {
          display: flex;
          align-items: stretch;
          justify-content: center;
          gap: 0;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          min-height: 400px;
        }

        .dropdown-left {
          flex: 1 1 0;
          padding: 2rem 2.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          background: linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%);
          box-sizing: border-box;
          position: relative;
          min-width: 280px;
          border-right: 1px solid #eee;
        }

        .dropdown-left-all {
          flex: 1;
          columns: 3;
          column-gap: 1.5rem;
          grid: unset;
          display: block;
          border-right: 2px solid #f0f0f0;
          padding: 1.25rem 1.5rem;
          background: linear-gradient(180deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%);
          overflow-y: auto;
          max-height: 580px;
          position: relative;
        }

        .dropdown-right-all {
          flex: 0 0 380px;
          padding: 0;
          width: 380px;
          min-width: 0;
        }

        .dropdown-right-all .category-images {
          width: 100%;
          height: 100%;
        }

        .dropdown-right-all .category-image-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 0;
          box-shadow: none;
          position: relative;
          overflow: hidden;
        }

        .dropdown-right-all .category-image-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 40%, transparent 45%, rgba(0,0,0,0.45) 100%);
          opacity: 1;
          transition: opacity 0.5s ease;
          z-index: 2;
          pointer-events: none;
        }

        .dropdown-right-all .category-image-wrapper:hover::before {
          opacity: 0.6;
        }

        .dropdown-right-all .category-image-wrapper:hover {
          box-shadow: none;
        }

        .dropdown-right-all .category-image-wrapper :global(img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          object-position: center center;
          transform: scale(1);
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease;
          filter: saturate(0.9) brightness(0.97);
          will-change: transform;
        }

        .dropdown-right-all .category-image-wrapper:hover :global(img) {
          transform: scale(1.08);
          filter: saturate(1.15) brightness(1.03);
        }

        .dropdown-left-all .dropdown-section {
          break-inside: avoid;
          margin-bottom: 0.8rem;
        }

        .dropdown-left::-webkit-scrollbar {
          width: 6px;
        }

        .dropdown-left::-webkit-scrollbar-track {
          background: #f5f5f5;
        }

        .dropdown-left::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }

        .dropdown-left::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .dropdown-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.35rem 0;
        }

        .section-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 0.4rem 0;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding-bottom: 0.35rem;
          border-bottom: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Inter', sans-serif;
        }

        .section-title::before {
          content: '';
          width: 3px;
          height: 14px;
          background: linear-gradient(180deg, #e74c3c, #e67e22);
          border-radius: 2px;
          flex-shrink: 0;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #e0e0e0, transparent);
          margin-left: 0.5rem;
        }

        .section-items {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .section-item-link {
          background: none;
          border: none;
          padding: 0.35rem 0.75rem;
          color: #555;
          font-size: 0.85rem;
          cursor: pointer;
          text-align: left;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          line-height: 1.3;
          border-radius: 6px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }

        .section-item-link::before {
          content: '';
          width: 0;
          height: 0;
          border-left: 4px solid #e74c3c;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translateX(-4px);
          flex-shrink: 0;
        }

        .section-item-link:hover {
          color: #e74c3c;
          background: rgba(231, 76, 60, 0.04);
          padding-left: 0.75rem;
        }

        .section-item-link:hover::before {
          opacity: 1;
          transform: translateX(0);
        }

        .dropdown-right {
          flex: 1 1 0;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 0;
          position: relative;
          min-width: 380px;
        }

        .category-images {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .category-image-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 0;
          overflow: hidden;
          background: #f0f0f0;
          border: none;
          box-shadow: none;
          position: relative;
        }

        .category-image-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 40%, transparent 50%, rgba(0,0,0,0.35) 100%);
          opacity: 1;
          transition: opacity 0.5s ease;
          z-index: 2;
          pointer-events: none;
        }

        .category-image-wrapper:hover::before {
          opacity: 0;
        }

        .category-image-wrapper:hover {
          box-shadow: none;
        }

        .category-image-wrapper :global(img) {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          transform: scale(1);
          transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.5s ease;
          display: block;
          filter: saturate(0.9) brightness(0.97);
          will-change: transform;
        }

        .category-image-wrapper:hover :global(img) {
          transform: scale(1.08);
          filter: saturate(1.15) brightness(1.03);
        }

        /* Dropdown Accent Bar */
        .dropdown-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e74c3c 0%, #e67e22 50%, #f39c12 100%);
          z-index: 10;
        }

        /* Shop All Link */
        .shop-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.5rem;
          padding: 0.4rem 0.85rem;
          background: none;
          border: 1.5px solid #e74c3c;
          color: #e74c3c;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', sans-serif;
        }

        .shop-all-link:hover {
          background: #e74c3c;
          color: #ffffff;
          transform: translateX(2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .shop-all-link svg {
          transition: transform 0.3s ease;
        }

        .shop-all-link:hover svg {
          transform: translateX(3px);
        }

        /* Image Overlay Text */
        .image-overlay-text {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem 1.5rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          pointer-events: none;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          transform: translateY(0);
        }

        .category-image-wrapper:hover .image-overlay-text {
          transform: translateY(10px);
          opacity: 0;
        }

        .dropdown-right-all .category-image-wrapper:hover .image-overlay-text {
          transform: translateY(0);
          opacity: 1;
        }

        .image-overlay-all {
          padding: 2.5rem 2rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%);
        }

        .overlay-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.6rem 1.5rem;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
          border: 1.5px solid rgba(255,255,255,0.5);
          color: #ffffff;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: auto;
          font-family: 'Inter', sans-serif;
        }

        .overlay-cta:hover {
          background: #ffffff;
          color: #1a1a1a;
          border-color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .overlay-cta svg {
          transition: transform 0.3s ease;
        }

        .overlay-cta:hover svg {
          transform: translateX(3px);
        }

        .overlay-label {
          color: rgba(255,255,255,0.8);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-family: 'Inter', sans-serif;
        }

        .overlay-category {
          color: #ffffff;
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-family: 'Inter', sans-serif;
        }

        /* Backdrop Overlay Effect */
        .dropdown-backdrop {
          display: none;
        }

        /* Hide category nav on mobile */
        @media (max-width: 1400px) {
          .dropdown-content {
            max-width: 95%;
          }
        }

        @media (max-width: 1200px) {
          .dropdown-inner {
            flex-direction: column;
            gap: 1.5rem;
            align-items: stretch;
          }

          .dropdown-left {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .category-image-wrapper {
            width: 100%;
            height: 200px;
          }
        }

        @media (max-width: 1024px) {
          .category-dropdown {
            padding: 1rem;
          }

          .dropdown-inner {
            flex-direction: column;
            gap: 1.5rem;
            align-items: stretch;
          }

          .dropdown-left {
            padding: 1rem;
          }

          .category-image-wrapper {
            width: 100%;
            height: 240px;
            border-radius: 8px;
          }
        }

        @media (max-width: 768px) {
          .category-nav {
            display: none;
          }

          .category-dropdown {
            padding: 0.5rem;
          }

          .dropdown-inner {
            gap: 1rem;
          }
        }
      `}</style>
    </>
  )
}
