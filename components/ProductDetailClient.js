'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import ReviewForm from './ReviewForm'
import ReviewsList from './ReviewsList'
import ProductQA from './ProductQA'

export default function ProductDetailClient({ product, images, category, brand, relatedProducts, reviews }) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [reviewStats, setReviewStats] = useState({
    avg: product.rating || 0,
    count: product.review_count || 0
  })
  const [reviewsRefresh, setReviewsRefresh] = useState(0)

  const displayPrice = product.discount_price || product.price
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const mainImage = images[selectedImage]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80'

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity })
      })
      if (response.ok) {
        alert('Added to cart successfully!')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleAddToWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id })
      })
      if (response.ok) {
        alert('Added to wishlist!')
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    setTimeout(() => router.push('/cart'), 500)
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/products">Products</Link></li>
              {category && (
                <li className="breadcrumb-item">
                  <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
                </li>
              )}
              <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container">
        {/* Main Product Section */}
        <div className="product-main">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <Image 
                src={mainImage}
                alt={product.name}
                width={700}
                height={700}
                style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                priority
              />
              {discountPercentage > 0 && (
                <span className="discount-badge">-{discountPercentage}%</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-gallery">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image 
                      src={img.url}
                      alt={img.alt || `${product.name} view ${index + 1}`}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            {brand && (
              <div className="product-brand">
                <Link href={`/products?brand=${brand.slug}`}>{brand.name}</Link>
              </div>
            )}
            <h1 className="product-title">{product.name}</h1>
            
            {/* Rating */}
            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.round(reviewStats.avg))}{'☆'.repeat(5 - Math.round(reviewStats.avg))}
              </div>
              <span className="rating-text">
                {reviewStats.avg?.toFixed?.(1) || '0.0'} ({reviewStats.count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="product-price">
              <span className="current-price">₹{displayPrice.toLocaleString('en-IN')}</span>
              {product.discount_price && (
                <>
                  <span className="original-price">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="save-text">You save ₹{(product.price - product.discount_price).toLocaleString('en-IN')}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm3.5 5.5l-4 4-2-2"/>
                  </svg>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            <p className="short-description">
              {product.description?.substring(0, 200)}...
            </p>

            {/* Key Features */}
            <div className="key-features">
              {product.material && (
                <div className="feature">
                  <strong>Material:</strong> {product.material}
                </div>
              )}
              {product.warranty && (
                <div className="feature">
                  <strong>Warranty:</strong> {product.warranty}
                </div>
              )}
              {product.delivery_info && (
                <div className="feature">
                  <strong>Delivery:</strong> {product.delivery_info}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {product.stock > 0 ? (
                <>
                  <button className="btn-primary btn-large" onClick={handleBuyNow}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1h14l2 13H1L3 1zm0 0l1 6m11-6l-1 6"/>
                    </svg>
                    Buy Now
                  </button>
                  <button className="btn-secondary btn-large" onClick={handleAddToCart}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1h14l2 13H1L3 1z"/>
                    </svg>
                    Add to Cart
                  </button>
                </>
              ) : (
                <button className="btn-disabled btn-large" disabled>
                  Out of Stock
                </button>
              )}
              <button className="btn-outline btn-icon" onClick={handleAddToWishlist}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 18l-1.5-1.5C4 12 1 9 1 5.5 1 3.5 2.5 2 4.5 2c1.5 0 3 1 3.5 2.5C8.5 3 10 2 11.5 2c2 0 3.5 1.5 3.5 3.5 0 3.5-3 6.5-7.5 11L10 18z"/>
                </svg>
              </button>
            </div>

            {/* Additional Info Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <strong>Tags:</strong>
                <div className="tags-list">
                  {product.tags.map((tag, index) => (
                    <Link 
                      key={index} 
                      href={`/products?q=${tag}`}
                      className="tag"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button 
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={activeTab === 'specifications' ? 'active' : ''}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={activeTab === 'reviews' ? 'active' : ''}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
            <button 
              className={activeTab === 'qa' ? 'active' : ''}
              onClick={() => setActiveTab('qa')}
            >
              Q&A
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'description' && (
              <div className="tab-pane">
                <h3>Product Description</h3>
                <p>{product.description}</p>
                {product.material && (
                  <>
                    <h4>Material & Build Quality</h4>
                    <p>{product.material}</p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-pane">
                <h3>Technical Specifications</h3>
                <table className="specs-table">
                  <tbody>
                    {product.dimensions && (
                      <tr>
                        <td><strong>Dimensions</strong></td>
                        <td>{JSON.stringify(product.dimensions, null, 2)}</td>
                      </tr>
                    )}
                    {product.material && (
                      <tr>
                        <td><strong>Material</strong></td>
                        <td>{product.material}</td>
                      </tr>
                    )}
                    {product.warranty && (
                      <tr>
                        <td><strong>Warranty</strong></td>
                        <td>{product.warranty}</td>
                      </tr>
                    )}
                    <tr>
                      <td><strong>SKU</strong></td>
                      <td>{product.id}</td>
                    </tr>
                    <tr>
                      <td><strong>Availability</strong></td>
                      <td>{product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane">
                <ReviewForm 
                  productId={product.id} 
                  onReviewSubmitted={() => setReviewsRefresh((n) => n + 1)} 
                />
                <ReviewsList 
                  productId={product.id} 
                  refresh={reviewsRefresh} 
                  onStatsChange={(avg, count) => setReviewStats({ avg, count })}
                />
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="tab-pane">
                <ProductQA productId={product.id} />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="products-grid">
              {relatedProducts.map(relatedProduct => (
                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .product-detail-page {
          background: #f8f9fa;
          min-height: 100vh;
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
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          color: #6c757d;
          font-size: 14px;
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

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .product-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          background: white;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 40px;
        }

        .product-gallery {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .main-image {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: #f8f9fa;
          margin-bottom: 16px;
        }

        .discount-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #dc3545;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 700;
        }

        .thumbnail-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .thumbnail {
          border: 2px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          background: none;
          padding: 0;
          transition: all 0.2s;
        }

        .thumbnail:hover,
        .thumbnail.active {
          border-color: #007bff;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .product-brand a {
          color: #007bff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .product-title {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          line-height: 1.3;
          margin: 0;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stars {
          color: #ffc107;
          font-size: 20px;
        }

        .rating-text {
          font-size: 14px;
          color: #666;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .current-price {
          font-size: 36px;
          font-weight: 700;
          color: #28a745;
        }

        .original-price {
          font-size: 24px;
          color: #999;
          text-decoration: line-through;
        }

        .save-text {
          font-size: 16px;
          color: #dc3545;
          font-weight: 600;
        }

        .stock-status {
          padding: 12px 16px;
          border-radius: 8px;
          display: inline-block;
        }

        .in-stock {
          background: #d4edda;
          color: #155724;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .out-of-stock {
          background: #f8d7da;
          color: #721c24;
          font-weight: 600;
        }

        .short-description {
          font-size: 16px;
          line-height: 1.8;
          color: #666;
        }

        .key-features {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .feature {
          padding: 8px 0;
          font-size: 14px;
          color: #333;
        }

        .feature strong {
          margin-right: 8px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .quantity-selector label {
          font-weight: 600;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
        }

        .quantity-controls button {
          width: 40px;
          height: 40px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          font-size: 20px;
          transition: background 0.2s;
        }

        .quantity-controls button:hover:not(:disabled) {
          background: #e9ecef;
        }

        .quantity-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-controls input {
          width: 60px;
          height: 40px;
          border: none;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-large {
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          flex: 1;
          min-width: 150px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #28a745;
          color: white;
          border: none;
        }

        .btn-secondary:hover {
          background: #218838;
        }

        .btn-outline {
          background: white;
          color: #333;
          border: 2px solid #dee2e6;
        }

        .btn-outline:hover {
          border-color: #007bff;
          color: #007bff;
        }

        .btn-icon {
          padding: 16px;
          min-width: auto;
          flex: 0;
        }

        .btn-disabled {
          background: #e9ecef;
          color: #6c757d;
          border: none;
          cursor: not-allowed;
        }

        .product-tags {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tags-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          padding: 6px 12px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 13px;
          color: #333;
          text-decoration: none;
          transition: all 0.2s;
        }

        .tag:hover {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .product-tabs {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 40px;
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid #dee2e6;
        }

        .tabs-header button {
          flex: 1;
          padding: 20px;
          background: none;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }

        .tabs-header button:hover {
          color: #007bff;
        }

        .tabs-header button.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        .tabs-content {
          padding: 40px;
        }

        .tab-pane h3 {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .tab-pane h4 {
          font-size: 18px;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        .tab-pane p {
          font-size: 16px;
          line-height: 1.8;
          color: #666;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .specs-table td {
          padding: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .specs-table td:first-child {
          width: 200px;
          background: #f8f9fa;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .review-item {
          padding: 24px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .review-rating {
          color: #ffc107;
          margin-top: 4px;
        }

        .review-date {
          color: #999;
          font-size: 14px;
        }

        .review-item h4 {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .review-item p {
          color: #666;
          line-height: 1.6;
        }

        .related-products {
          margin-bottom: 60px;
        }

        .related-products h2 {
          font-size: 28px;
          margin-bottom: 30px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .product-main {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .product-gallery {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .product-main {
            padding: 24px;
          }

          .product-title {
            font-size: 24px;
          }

          .current-price {
            font-size: 28px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-large {
            width: 100%;
          }

          .tabs-header {
            overflow-x: auto;
          }

          .tabs-header button {
            white-space: nowrap;
          }

          .tabs-content {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  )
}

function RelatedProductCard({ product }) {
  const displayPrice = product.discount_price || product.price
  const mainImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'

  return (
    <Link href={`/products/${product.slug}`} className="related-product-card">
      <div className="product-image">
        <Image 
          src={mainImage}
          alt={product.name}
          width={300}
          height={300}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <div className="rating">
          <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
          <span className="count">({product.review_count})</span>
        </div>
        <div className="price">
          <span className="current">₹{displayPrice.toLocaleString('en-IN')}</span>
          {product.discount_price && (
            <span className="original">₹{product.price.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>

      <style jsx>{`
        .related-product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s;
        }

        .related-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .product-image {
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: #f8f9fa;
        }

        .product-info {
          padding: 16px;
        }

        .product-info h4 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }

        .stars {
          color: #ffc107;
          font-size: 14px;
        }

        .count {
          font-size: 12px;
          color: #666;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .current {
          font-size: 18px;
          font-weight: 700;
          color: #28a745;
        }

        .original {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }
      `}</style>
    </Link>
  )
}
