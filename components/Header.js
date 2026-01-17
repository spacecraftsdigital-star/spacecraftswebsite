"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../app/providers/AuthProvider'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { user, profile, isAuthenticated, signOut, loading } = useAuth()
  const router = useRouter()
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

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
      const res = await fetch('/api/cart/get')
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
              <Image src="/logo.webp" alt="Spacecrafts Furniture" width={160} height={45} priority />
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
        }

        .header-logo a {
          display: block;
        }

        /* Search */
        .header-search {
          flex: 1;
          max-width: 600px;
          position: relative;
        }

        .search-form {
          display: flex;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e5e5;
          transition: all 0.2s;
        }

        .search-form:focus-within {
          border-color: #333;
          background: white;
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          outline: none;
          background: transparent;
          color: #333;
        }

        .search-input::placeholder {
          color: #999;
        }

        .search-button {
          background: none;
          border: none;
          padding: 0 1.25rem;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .search-button:hover {
          color: #333;
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
        }

        @media (max-width: 768px) {
          .header-container {
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;
          }

          .header-logo {
            order: 1;
          }

          .mobile-menu-toggle {
            display: block;
            order: 2;
            margin-left: auto;
          }

          .header-search {
            order: 3;
            width: 100%;
            max-width: none;
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
      `}</style>
    </>
  )
}
