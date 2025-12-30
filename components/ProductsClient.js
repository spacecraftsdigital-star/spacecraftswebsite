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
    category: searchParams?.category || '',
    brand: searchParams?.brand || '',
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
      if (newFilters[key]) {
        params.set(key, newFilters[key])
      }
    })
    router.push(`/products?${params.toString()}`)
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
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
              <h4>Search Products</h4>
              <input
                type="text"
                placeholder="Search..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="search-input"
              />
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h4>Categories</h4>
              <ul className="filter-list">
                <li>
                  <label>
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                    />
                    <span>All Categories</span>
                  </label>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <label>
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat.slug}
                        onChange={() => handleFilterChange('category', cat.slug)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brands */}
            <div className="filter-section">
              <h4>Brands</h4>
              <ul className="filter-list">
                <li>
                  <label>
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brand === ''}
                      onChange={() => handleFilterChange('brand', '')}
                    />
                    <span>All Brands</span>
                  </label>
                </li>
                {brands.map(brand => (
                  <li key={brand.id}>
                    <label>
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brand === brand.slug}
                        onChange={() => handleFilterChange('brand', brand.slug)}
                      />
                      <span>{brand.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="price-input"
                />
                <span>to</span>
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
              Clear All Filters
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
          background: white;
          padding: 20px 0;
          border-bottom: 1px solid #e9ecef;
          margin-bottom: 30px;
        }

        .breadcrumb {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 8px;
        }

        .breadcrumb-item {
          color: #6c757d;
        }

        .breadcrumb-item a {
          color: #007bff;
          text-decoration: none;
        }

        .breadcrumb-item a:hover {
          text-decoration: underline;
        }

        .breadcrumb-item.active {
          color: #333;
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
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .sidebar-header h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #666;
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
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #333;
        }

        .search-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
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

        .price-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .price-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .clear-filters-btn {
          width: 100%;
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: #e9ecef;
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
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          gap: 16px;
          flex-wrap: wrap;
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
          padding: 8px 16px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .results-count {
          font-size: 14px;
          color: #666;
        }

        .sort-select {
          padding: 8px 32px 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          background: white;
        }

        .view-toggle {
          display: flex;
          gap: 4px;
        }

        .view-toggle button {
          padding: 8px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }

        .view-toggle button:hover:not(.active) {
          background: #f8f9fa;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .products-grid.list-view {
          grid-template-columns: 1fr;
        }

        .no-products {
          background: white;
          padding: 60px 20px;
          text-align: center;
          border-radius: 12px;
        }

        .no-products p {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }

        .btn-primary {
          padding: 12px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #0056b3;
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
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const displayPrice = product.discount_price || product.price
  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'

  return (
    <Link href={`/products/${product.slug}`} className={`product-card ${view === 'list' ? 'list-card' : ''}`}>
      <div className="product-image">
        <Image 
          src={mainImage}
          alt={product.name}
          width={view === 'list' ? 200 : 300}
          height={view === 'list' ? 200 : 300}
          style={{ objectFit: 'cover' }}
        />
        {discountPercentage > 0 && (
          <span className="discount-badge">-{discountPercentage}%</span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{product.categories?.name || 'Furniture'}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
          <span className="rating-text">({product.review_count} reviews)</span>
        </div>
        <div className="product-price">
          <span className="current-price">₹{displayPrice.toLocaleString('en-IN')}</span>
          {product.discount_price && (
            <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
        {view === 'list' && product.description && (
          <p className="product-description">
            {product.description.substring(0, 150)}...
          </p>
        )}
      </div>

      <style jsx>{`
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .product-card.list-card {
          display: flex;
          flex-direction: row;
        }

        .product-card.list-card .product-image {
          width: 200px;
          flex-shrink: 0;
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .product-card.list-card .product-image {
          height: 200px;
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #dc3545;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .stock-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: #ffc107;
          color: #333;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-info {
          padding: 16px;
        }

        .product-card.list-card .product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .product-category {
          font-size: 12px;
          color: #007bff;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #333;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card.list-card .product-name {
          font-size: 18px;
          -webkit-line-clamp: 1;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .stars {
          color: #ffc107;
          font-size: 16px;
        }

        .rating-text {
          font-size: 13px;
          color: #666;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .current-price {
          font-size: 20px;
          font-weight: 700;
          color: #28a745;
        }

        .original-price {
          font-size: 16px;
          color: #999;
          text-decoration: line-through;
        }

        .product-description {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-top: 12px;
        }

        @media (max-width: 768px) {
          .product-card.list-card {
            flex-direction: column;
          }

          .product-card.list-card .product-image {
            width: 100%;
            height: 250px;
          }
        }
      `}</style>
    </Link>
  )
}
