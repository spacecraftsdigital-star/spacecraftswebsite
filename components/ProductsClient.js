'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProductsClient({ initialProducts, categories, brands, searchParams, categoryPage }) {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const [products, setProducts] = useState(initialProducts)
  const [filters, setFilters] = useState({
    categories: searchParams?.categories ? searchParams.categories.split(',') : [],
    brands: searchParams?.brands ? searchParams.brands.split(',') : [],
    minPrice: searchParams?.minPrice || '',
    maxPrice: searchParams?.maxPrice || '',
    sort: searchParams?.sort || 'rating-desc',
    q: searchParams?.q || ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState('grid') // grid or list

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const updateFilters = (newFilters) => {
    // Helper to build common query params
    const buildParams = (f) => {
      const params = new URLSearchParams()
      if (f.sort && f.sort !== 'rating-desc') params.set('sort', f.sort)
      if (f.brands?.length > 0) params.set('brands', f.brands.join(','))
      if (f.minPrice) params.set('minPrice', f.minPrice)
      if (f.maxPrice) params.set('maxPrice', f.maxPrice)
      if (f.q) params.set('q', f.q)
      return params
    }

    const catCount = newFilters.categories?.length || 0

    // No categories selected → go to /products
    if (catCount === 0) {
      const params = buildParams(newFilters)
      const qs = params.toString()
      router.push(`/products${qs ? '?' + qs : ''}`)
      return
    }

    // Exactly 1 category → SEO-friendly URL
    if (catCount === 1) {
      const params = buildParams(newFilters)
      const qs = params.toString()
      router.push(`/products/category/${newFilters.categories[0]}${qs ? '?' + qs : ''}`)
      return
    }

    // Multiple categories → /products with query params
    const params = buildParams(newFilters)
    params.set('categories', newFilters.categories.join(','))
    router.push(`/products?${params.toString()}`)
  }

  const handleMultiSelect = (key, value) => {
    const currentArray = filters[key] || []
    let newArray
    if (currentArray.includes(value)) {
      newArray = currentArray.filter(item => item !== value)
    } else {
      newArray = [...currentArray, value]
    }
    const newFilters = { ...filters, [key]: newArray }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const clearFilters = () => {
    if (categoryPage) {
      setFilters({
        categories: [categoryPage.slug],
        brands: [],
        minPrice: '',
        maxPrice: '',
        sort: 'rating-desc',
        q: ''
      })
      router.push(`/products/category/${categoryPage.slug}`)
    } else {
      setFilters({
        categories: [],
        brands: [],
        minPrice: '',
        maxPrice: '',
        sort: 'rating-desc',
        q: ''
      })
      router.push('/products')
    }
  }

  const activeFilterCount = filters.categories.length + filters.brands.length + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)

  return (
    <div className="products-page">
      {/* Compact Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              {categoryPage && (
                <li className="breadcrumb-item active" aria-current="page">{categoryPage.name}</li>
              )}
            </ol>
          </nav>
        </div>
      </div>

      <div className="container products-container">
        {/* Toolbar — always on top */}
        <div className="products-toolbar">
          <div className="toolbar-left">
            <button 
              className={`sidebar-toggle-btn ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
            {/* Mobile filter */}
            <button 
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="16" y2="12"/>
                <line x1="4" y1="18" x2="12" y2="18"/>
              </svg>
              Filters
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
            <span className="results-count">{products.length} Products</span>
            {categoryPage && <span className="category-label">{categoryPage.name}</span>}
          </div>
          
          <div className="toolbar-right">
            <select 
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="sort-select"
            >
              <option value="rating-desc">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>

            <div className="view-toggle">
              <button 
                className={view === 'grid' ? 'active' : ''}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="2" width="7" height="7" rx="1"/>
                  <rect x="11" y="2" width="7" height="7" rx="1"/>
                  <rect x="2" y="11" width="7" height="7" rx="1"/>
                  <rect x="11" y="11" width="7" height="7" rx="1"/>
                </svg>
              </button>
              <button 
                className={view === 'list' ? 'active' : ''}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="3" width="16" height="3" rx="1"/>
                  <rect x="2" y="8" width="16" height="3" rx="1"/>
                  <rect x="2" y="13" width="16" height="3" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={`products-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {/* Sidebar Filters */}
          <aside className={`products-sidebar ${showFilters ? 'show' : ''} ${sidebarOpen ? '' : 'desktop-hidden'}`}>
            <div className="sidebar-header">
              <span className="sidebar-title">Filters</span>
              {activeFilterCount > 0 && (
                <button className="clear-all-btn" onClick={clearFilters}>Clear all</button>
              )}
              <button 
                className="close-sidebar"
                onClick={() => setShowFilters(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '14px', scrollbarWidth: 'thin', scrollbarColor: '#ddd transparent' }}>
            {/* Search */}
            <div className="filter-group">
              <div className="filter-search-wrap">
                <svg className="filter-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="filter-search-input"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="filter-group">
              <div className="filter-group-title">Category</div>
              <div className="filter-chips">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`chip ${filters.categories.includes(cat.slug) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('categories', cat.slug)}
                  >
                    {filters.categories.includes(cat.slug) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="filter-group">
              <div className="filter-group-title">Brand</div>
              <div className="filter-chips">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    className={`chip ${filters.brands.includes(brand.slug) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('brands', brand.slug)}
                  >
                    {filters.brands.includes(brand.slug) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <div className="filter-group-title">Price Range</div>
              <div className="price-inputs">
                <div className="price-field">
                  <span className="price-prefix">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="price-input"
                  />
                </div>
                <span className="price-dash">–</span>
                <div className="price-field">
                  <span className="price-prefix">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>
            </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="products-main">
            {products.length === 0 ? (
              <div className="no-products">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <p>No products found matching your criteria.</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`products-grid ${view === 'list' ? 'list-view' : ''}`}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} view={view} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .products-page {
          background: #f5f5f7;
          min-height: 100vh;
          padding-bottom: 40px;
        }

        /* ===== Compact Breadcrumb (matches product page) ===== */
        .breadcrumb-section {
          background: #ffffff;
          padding: 10px 0;
          border-bottom: 1px solid #e5e5e5;
        }

        .breadcrumb {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 2px;
          flex-wrap: wrap;
          align-items: center;
        }

        .breadcrumb-item {
          color: #1a1a1a;
          font-size: 12px;
          font-weight: 400;
        }

        .breadcrumb-item a {
          color: #e67e22;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-item a:hover {
          color: #d35400;
        }

        .breadcrumb-item.active {
          color: #333;
          font-weight: 500;
        }

        .breadcrumb-item:not(:last-child)::after {
          content: '›';
          margin: 0 6px;
          color: #ccc;
          font-size: 13px;
        }

        .container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 16px;
        }

        /* ===== Toolbar ===== */
        .products-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          margin-bottom: 2px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sidebar-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
        }

        .sidebar-toggle-btn:hover {
          border-color: #222;
        }

        .sidebar-toggle-btn.active {
          background: #222;
          color: #fff;
          border-color: #222;
        }

        .filter-count {
          background: #e67e22;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .filter-toggle-btn {
          display: none;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: #333;
        }

        .results-count {
          font-size: 13px;
          color: #888;
          font-weight: 500;
        }

        .category-label {
          font-size: 13px;
          font-weight: 600;
          color: #222;
          padding: 4px 10px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .sort-select {
          padding: 7px 28px 7px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          background: #fff;
          color: #444;
          transition: border-color 0.2s;
        }

        .sort-select:hover,
        .sort-select:focus {
          border-color: #222;
          outline: none;
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          background: #f0f0f0;
          padding: 3px;
          border-radius: 6px;
        }

        .view-toggle button {
          padding: 5px 8px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          color: #aaa;
          display: flex;
          align-items: center;
        }

        .view-toggle button.active {
          background: #fff;
          color: #222;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        /* ===== Layout ===== */
        .products-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .products-layout {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        /* ===== Modern Sidebar ===== */
        .products-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #fff;
          border-radius: 8px;
          padding: 0;
          position: sticky;
          top: 90px;
          max-height: calc(100vh - 100px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid #eee;
        }



        .products-sidebar.desktop-hidden {
          display: none;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-bottom: 1px solid #f0f0f0;
          background: #fff;
          flex-shrink: 0;
          z-index: 2;
        }

        .sidebar-title {
          font-size: 13px;
          font-weight: 700;
          color: #222;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .clear-all-btn {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 11px;
          color: #e67e22;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 0;
          transition: color 0.2s;
        }

        .clear-all-btn:hover {
          color: #d35400;
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          padding: 2px;
          transition: color 0.2s;
        }

        .close-sidebar:hover {
          color: #333;
        }

        /* Filter groups */
        .filter-group {
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f5f5f5;
        }

        .filter-group:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .filter-group-title {
          font-size: 11px;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        /* Search inside sidebar */
        .filter-search-wrap {
          position: relative;
        }

        .filter-search-icon {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #bbb;
          pointer-events: none;
        }

        .filter-search-input {
          width: 100%;
          padding: 7px 10px 7px 30px;
          border: 1px solid #eee;
          border-radius: 6px;
          font-size: 12px;
          background: #fafafa;
          transition: all 0.2s;
          color: #333;
        }

        .filter-search-input:focus {
          outline: none;
          border-color: #222;
          background: #fff;
        }

        .filter-search-input::placeholder {
          color: #bbb;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .chip {
          padding: 5px 10px;
          background: #f7f7f7;
          border: 1px solid #eee;
          border-radius: 100px;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          color: #555;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          line-height: 1.3;
        }

        .chip:hover {
          background: #f0f0f0;
          border-color: #ccc;
          color: #222;
        }

        .chip.active {
          background: #222;
          color: #fff;
          border-color: #222;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .price-field {
          flex: 1;
          position: relative;
        }

        .price-prefix {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #999;
          pointer-events: none;
        }

        .price-dash {
          color: #ccc;
          font-size: 12px;
          flex-shrink: 0;
        }

        .price-input {
          width: 100%;
          padding: 6px 8px 6px 22px;
          border: 1px solid #eee;
          border-radius: 6px;
          font-size: 12px;
          background: #fafafa;
          transition: all 0.2s;
        }

        .price-input:focus {
          outline: none;
          border-color: #222;
          background: #fff;
        }

        .price-input::placeholder {
          color: #bbb;
        }

        /* ===== Main Content ===== */
        .products-main {
          flex: 1;
          min-width: 0;
        }

        /* Grid: 4 cols with sidebar, 5 cols without */
        .sidebar-open .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .sidebar-closed .products-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .products-grid.list-view {
          grid-template-columns: 1fr !important;
        }

        .no-products {
          background: white;
          padding: 60px 20px;
          text-align: center;
          border-radius: 8px;
          border: 1px solid #eee;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .no-products p {
          font-size: 14px;
          color: #888;
          margin: 0;
        }

        .btn-primary {
          padding: 8px 24px;
          background: #222;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #000;
        }

        /* ===== Responsive ===== */
        @media (max-width: 1200px) {
          .sidebar-open .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .sidebar-toggle-btn {
            display: none;
          }
          .filter-toggle-btn {
            display: flex;
          }
          .products-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1001;
            border-radius: 0;
            width: 280px;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            max-height: 100vh;
          }

          .products-sidebar.show {
            transform: translateX(0);
          }

          .products-sidebar.desktop-hidden {
            display: block;
            transform: translateX(-100%);
          }

          .products-sidebar.desktop-hidden.show {
            transform: translateX(0);
          }

          .close-sidebar {
            display: block;
          }

          .sidebar-open .products-grid,
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .sidebar-open .products-grid,
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .products-toolbar {
            padding: 8px 0;
          }

          .category-label {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .sidebar-open .products-grid,
          .sidebar-closed .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}

function ProductCard({ product, view }) {
  const [isHovering, setIsHovering] = useState(false)
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const displayPrice = product.discount_price || product.price
  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'

  return (
    <Link 
      href={`/products/${product.slug}`} 
      className={`product-card ${view === 'list' ? 'list-card' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="product-image-wrapper">
        <div className="product-image">
          <div className={`image-container ${isHovering ? 'hovering' : ''}`}>
            <Image 
              src={mainImage}
              alt={product.name}
              width={view === 'list' ? 200 : 300}
              height={view === 'list' ? 200 : 300}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
          <div className={`image-overlay ${isHovering ? 'visible' : ''}`}></div>
        </div>
        {discountPercentage > 0 && (
          <span className="discount-badge">
            <span className="discount-value">-{discountPercentage}%</span>
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{product.categories?.name || 'Furniture'}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
          <span className="rating-text">({product.review_count || 0})</span>
        </div>
        <div className="product-price-section">
          <div className="product-price">
            <span className="current-price">₹{displayPrice.toLocaleString('en-IN')}</span>
            {product.discount_price && (
              <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          <div className="price-badge">Save ₹{(product.price - displayPrice).toLocaleString('en-IN')}</div>
        </div>
        {view === 'list' && product.description && (
          <p className="product-description">
            {product.description.substring(0, 150)}...
          </p>
        )}
        <button className="product-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </button>
      </div>

      <style jsx>{`
        .product-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.25s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          border: 1px solid #eee;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border-color: #ddd;
        }

        .product-card.list-card {
          display: flex;
          flex-direction: row;
        }

        .product-card.list-card .product-image-wrapper {
          width: 220px;
          flex-shrink: 0;
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: #f5f5f5;
        }

        .product-card.list-card .product-image {
          height: 250px;
        }

        .image-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          position: relative;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          display: block;
          transform: scale(1);
        }

        .image-container.hovering img {
          transform: scale(1.08);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0) 0%, rgba(0, 123, 255, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .image-overlay.visible {
          opacity: 1;
        }

        .discount-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ff5252;
          color: white;
          padding: 0;
          border-radius: 50%;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(255, 82, 82, 0.25);
        }

        .discount-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        @keyframes badgePulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .stock-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          background: #ffc107;
          color: #333;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .out-of-stock-badge {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          backdrop-filter: blur(2px);
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .product-info {
          padding: 10px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-card.list-card .product-info {
          flex: 1;
          justify-content: center;
          padding: 18px 24px;
        }

        .product-category {
          font-size: 10px;
          color: #e67e22;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .product-name {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          color: #1a1a1a;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }

        .product-card:hover .product-name {
          color: #e67e22;
        }

        .product-card.list-card .product-name {
          font-size: 18px;
          -webkit-line-clamp: 1;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
        }

        .stars {
          color: #ffc107;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .rating-text {
          font-size: 12px;
          color: #999;
          font-weight: 500;
        }

        .product-price-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current-price {
          font-size: 15px;
          font-weight: 700;
          color: #222;
        }

        .original-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
          font-weight: 400;
        }

        .price-badge {
          font-size: 11px;
          color: #ff6b6b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .product-description {
          font-size: 13px;
          color: #666;
          line-height: 1.6;
          margin: 8px 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-action-btn {
          margin-top: 4px;
          padding: 8px 12px;
          background: #222;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          opacity: 0;
          transform: translateY(6px);
        }

        .product-card:hover .product-action-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .product-action-btn:hover {
          background: #000;
        }

        .product-card.list-card .product-action-btn {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .product-card.list-card {
            flex-direction: column;
          }

          .product-card.list-card .product-image-wrapper {
            width: 100%;
          }

          .product-image {
            height: 220px;
          }

          .product-card.list-card .product-image {
            height: 220px;
          }

          .product-action-btn {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Link>
  )
}
