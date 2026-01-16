'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProductsClient({ initialProducts, categories, brands, searchParams }) {
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
  const [view, setView] = useState('grid') // grid or list

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams()
    Object.keys(newFilters).forEach(key => {
      if (key === 'categories' || key === 'brands') {
        if (newFilters[key] && newFilters[key].length > 0) {
          params.set(key, newFilters[key].join(','))
        }
      } else if (newFilters[key]) {
        params.set(key, newFilters[key])
      }
    })
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

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Products</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container products-container">
        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`products-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button 
                className="close-sidebar"
                onClick={() => setShowFilters(false)}
              >
                ×
              </button>
            </div>

            {/* Search */}
            <div className="filter-section">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Search
              </h4>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="search-input"
              />
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2H2v7h10V2zm10 0h-8v7h8V2zM4 11v11h8V11H4zm10 0v11h8V11h-8z"/>
                </svg>
                Categories
              </h4>
              <div className="filter-chips">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`chip ${filters.categories.includes(cat.slug) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('categories', cat.slug)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="filter-section">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
                </svg>
                Brands
              </h4>
              <div className="filter-chips">
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    className={`chip ${filters.brands.includes(brand.slug) ? 'active' : ''}`}
                    onClick={() => handleMultiSelect('brands', brand.slug)}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M8 6h8M6 10h12M8 14h8M6 18h12"/>
                </svg>
                Price Range
              </h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="price-input"
                />
                <span className="price-separator">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m0 0v-5h-5"/>
              </svg>
              Reset Filters
            </button>
          </aside>

          {/* Main Content */}
          <main className="products-main">
            {/* Toolbar */}
            <div className="products-toolbar">
              <div className="toolbar-left">
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4h14M6 10h8M9 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Filters
                </button>
                <span className="results-count">{products.length} Products</span>
              </div>
              
              <div className="toolbar-right">
                {/* Sort */}
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

                {/* View Toggle */}
                <div className="view-toggle">
                  <button 
                    className={view === 'grid' ? 'active' : ''}
                    onClick={() => setView('grid')}
                    aria-label="Grid view"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
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
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <rect x="2" y="3" width="16" height="3" rx="1"/>
                      <rect x="2" y="8" width="16" height="3" rx="1"/>
                      <rect x="2" y="13" width="16" height="3" rx="1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="no-products">
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
          background: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 60px;
        }

        .breadcrumb-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          padding: 24px 0;
          border-bottom: 1px solid #e9ecef;
          margin-bottom: 32px;
        }

        .breadcrumb {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 4px;
          align-items: center;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          color: #6c757d;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          animation: slideInBreadcrumb 0.4s ease-out backwards;
        }

        @keyframes slideInBreadcrumb {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .breadcrumb-item:nth-child(1) { animation-delay: 0.05s; }
        .breadcrumb-item:nth-child(2) { animation-delay: 0.1s; }
        .breadcrumb-item:nth-child(3) { animation-delay: 0.15s; }
        .breadcrumb-item:nth-child(4) { animation-delay: 0.2s; }
        .breadcrumb-item:nth-child(5) { animation-delay: 0.25s; }

        .breadcrumb-item a {
          color: #007bff;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border-radius: 6px;
          position: relative;
        }

        .breadcrumb-item a::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 123, 255, 0) 0%, rgba(0, 123, 255, 0.1) 100%);
          border-radius: 6px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .breadcrumb-item a:hover {
          color: #0056b3;
          background: rgba(0, 123, 255, 0.08);
          transform: translateX(2px);
        }

        .breadcrumb-item a:hover::before {
          opacity: 1;
        }

        .breadcrumb-item.active {
          color: #333;
          font-weight: 600;
        }

        .breadcrumb-item:not(:last-child)::after {
          content: '›';
          margin-left: 8px;
          color: #dee2e6;
          font-weight: 300;
          transition: all 0.3s ease;
        }

        .breadcrumb-item:hover:not(:last-child)::after {
          color: #007bff;
          transform: scaleX(1.2);
        }

        .products-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .products-layout {
          display: flex;
          gap: 30px;
          align-items: flex-start;
        }

        .products-sidebar {
          width: 280px;
          background: white;
          border-radius: 12px;
          padding: 24px;
          position: sticky;
          top: 20px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .products-sidebar::-webkit-scrollbar {
          display: none;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f4f9;
        }

        .sidebar-header h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #999;
          transition: color 0.2s;
        }

        .close-sidebar:hover {
          color: #333;
        }

        .filter-section {
          margin-bottom: 28px;
          padding-bottom: 28px;
          border-bottom: 1px solid #e9ecef;
        }

        .filter-section:last-child {
          border-bottom: none;
        }

        .filter-section h4 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-section h4 svg {
          color: #007bff;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chip {
          padding: 8px 14px;
          background: #f0f4f9;
          border: 1.5px solid transparent;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #555;
          white-space: nowrap;
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .chip:hover {
          background: #e6eef7;
          border-color: #007bff;
          color: #007bff;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
        }

        .chip.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
          font-weight: 600;
        }

        .chip.active::before {
          content: '✓';
          display: inline-block;
          width: 16px;
          height: 16px;
          background: white;
          color: #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          margin-right: 2px;
        }

        .filter-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .filter-list li {
          margin-bottom: 10px;
        }

        .filter-list label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 6px 0;
          transition: color 0.2s;
        }

        .filter-list label:hover {
          color: #007bff;
        }

        .filter-list input[type="radio"] {
          cursor: pointer;
        }

        .price-inputs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-separator {
          color: #aaa;
          font-weight: 600;
          flex-shrink: 0;
        }

        .price-input {
          flex: 1;
          padding: 10px 12px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          font-size: 13px;
          background: white;
          transition: all 0.2s;
        }

        .price-input:focus {
          outline: none;
          border-color: #007bff;
          background: #f8fbff;
        }

        .price-input::placeholder {
          color: #aaa;
        }

        .clear-filters-btn {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1.5px solid #dee2e6;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .clear-filters-btn:hover {
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
          border-color: #bdc3c7;
          color: #333;
        }

        .search-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          background: #f8fbff;
        }

        .search-input::placeholder {
          color: #aaa;
        }

        .products-main {
          flex: 1;
          min-width: 0;
        }

        .products-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 18px 20px;
          border-radius: 12px;
          margin-bottom: 28px;
          gap: 16px;
          flex-wrap: wrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #f0f0f0;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .filter-toggle-btn {
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 1.5px solid #dee2e6;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .filter-toggle-btn:hover {
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
          border-color: #bdc3c7;
        }

        .results-count {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .sort-select {
          padding: 10px 32px 10px 12px;
          border: 1.5px solid #dee2e6;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
          color: #555;
        }

        .sort-select:hover {
          border-color: #007bff;
        }

        .sort-select:focus {
          outline: none;
          border-color: #007bff;
          background: #f8fbff;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f8f9fa;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .view-toggle button {
          padding: 8px 12px;
          background: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          color: #999;
          display: flex;
          align-items: center;
        }

        .view-toggle button.active {
          background: white;
          color: #007bff;
          box-shadow: 0 2px 6px rgba(0, 123, 255, 0.15);
        }

        .view-toggle button:hover:not(.active) {
          color: #555;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 28px;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .products-grid.list-view {
          grid-template-columns: 1fr;
        }

        .no-products {
          background: white;
          padding: 80px 20px;
          text-align: center;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .no-products p {
          font-size: 18px;
          color: #666;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .btn-primary {
          padding: 12px 32px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .products-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s;
            max-height: 100vh;
          }

          .products-sidebar.show {
            transform: translateX(0);
          }

          .close-sidebar {
            display: block;
          }

          .filter-toggle-btn {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }

          .products-toolbar {
            padding: 12px 16px;
          }

          .toolbar-left,
          .toolbar-right {
            gap: 12px;
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
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
          border-color: #e0e0e0;
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
          height: 300px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #f0f1f3 100%);
        }

        .product-card.list-card .product-image {
          height: 220px;
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
          object-fit: cover;
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
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
          color: white;
          padding: 0;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
          animation: badgePulse 0.6s ease-out;
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
          bottom: 12px;
          left: 12px;
          background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
          color: #333;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
          animation: slideIn 0.4s ease-out;
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
          padding: 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .product-card.list-card .product-info {
          flex: 1;
          justify-content: center;
          padding: 18px 24px;
        }

        .product-category {
          font-size: 11px;
          color: #007bff;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .product-name {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
          color: #1a1a1a;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }

        .product-card:hover .product-name {
          color: #007bff;
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
          font-size: 18px;
          font-weight: 700;
          color: #28a745;
        }

        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
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
          margin-top: 8px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          opacity: 0;
          transform: translateY(10px);
        }

        .product-card:hover .product-action-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .product-action-btn:hover {
          background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          transform: translateY(-2px);
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
            height: 250px;
          }

          .product-card.list-card .product-image {
            height: 250px;
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
