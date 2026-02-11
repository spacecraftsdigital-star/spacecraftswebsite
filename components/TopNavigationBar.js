"use client"
import Link from 'next/link'
import { useState } from 'react'

export default function TopNavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Buy In Bulk', href: '/bulk-orders' },
    { label: 'Contact Us', href: '/contact' }
  ]

  return (
    <nav className="top-nav-bar">
      <div className="nav-container">
        {/* Left Section: Contact Info */}
        <div className="nav-left">
          <div className="contact-info">
            <span className="info-icon">📞</span>
            <a href="tel:+919003003733" className="phone-link" aria-label="Call Ambattur store">
              AMBATTUR: 90030 03733
            </a>
          </div>
          <div className="gstin-info">
            <span className="info-label">GSTIN/UIN:</span>
            <span className="gstin-value">33ACSFS7628C1ZV</span>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Right Section: Navigation Links */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map((item) => (
            <li key={item.href} className="nav-item">
              <Link 
                href={item.href} 
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .top-nav-bar {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border-bottom: 1px solid #1a252f;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 999;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        /* Left Section */
        .nav-left {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex: 0 1 auto;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .info-icon {
          font-size: 1rem;
          line-height: 1;
        }

        .phone-link {
          color: #ecf0f1;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          transition: all 0.3s ease;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          display: inline-block;
        }

        .phone-link:hover {
          color: #fff;
          background: rgba(231, 76, 60, 0.2);
          text-decoration: underline;
        }

        .gstin-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #bdc3c7;
        }

        .info-label {
          font-weight: 600;
          color: #ecf0f1;
        }

        .gstin-value {
          font-family: 'Courier New', monospace;
          color: #ecf0f1;
          letter-spacing: 0.2px;
        }

        /* Right Section - Navigation Menu */
        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2.5rem;
          align-items: center;
          flex: 0 1 auto;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          background: none;
          border: none;
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0.5rem 0;
          letter-spacing: 0.4px;
          position: relative;
          display: inline-block;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #e74c3c, #e67e22);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover {
          color: #fff;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          gap: 6px;
          margin-left: auto;
        }

        .mobile-menu-toggle span {
          width: 25px;
          height: 3px;
          background: #ecf0f1;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Responsive - Tablet */
        @media (max-width: 1024px) {
          .nav-container {
            padding: 0.85rem 1.5rem;
            gap: 1.5rem;
          }

          .nav-left {
            gap: 1.5rem;
          }

          .contact-info {
            gap: 0.5rem;
          }

          .phone-link {
            font-size: 0.85rem;
            padding: 0.3rem 0.6rem;
          }

          .gstin-info {
            font-size: 0.8rem;
          }

          .nav-menu {
            gap: 1.8rem;
          }

          .nav-link {
            font-size: 0.85rem;
          }
        }

        /* Responsive - Mobile */
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .nav-container {
            flex-wrap: wrap;
            padding: 0.75rem 1rem;
            gap: 1rem;
          }

          .nav-left {
            width: 100%;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.75rem;
            order: 1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 1rem;
            margin-bottom: 0.5rem;
          }

          .contact-info {
            width: 100%;
            justify-content: center;
            gap: 0.5rem;
          }

          .phone-link {
            font-size: 0.85rem;
          }

          .gstin-info {
            width: 100%;
            justify-content: center;
            font-size: 0.75rem;
          }

          .nav-menu {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(44, 62, 80, 0.98);
            flex-direction: column;
            gap: 0;
            padding: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
            z-index: 1000;
          }

          .nav-menu.mobile-open {
            max-height: 400px;
            overflow-y: auto;
          }

          .nav-item {
            width: 100%;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .nav-link {
            display: block;
            padding: 1rem 1.5rem;
            width: 100%;
            text-align: left;
            font-size: 0.9rem;
          }

          .nav-link::after {
            display: none;
          }

          .nav-link:active {
            background: rgba(231, 76, 60, 0.2);
          }

          .mobile-menu-toggle {
            order: 2;
            margin: 0;
          }
        }

        /* Responsive - Small Mobile */
        @media (max-width: 480px) {
          .nav-container {
            padding: 0.6rem 0.75rem;
          }

          .nav-left {
            padding-bottom: 0.75rem;
            margin-bottom: 0.5rem;
            gap: 0.5rem;
          }

          .contact-info {
            gap: 0.4rem;
          }

          .info-icon {
            font-size: 0.9rem;
          }

          .phone-link {
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
          }

          .gstin-info {
            font-size: 0.7rem;
            gap: 0.3rem;
          }

          .nav-link {
            font-size: 0.85rem;
            padding: 0.85rem 1rem;
          }
        }
      `}</style>
    </nav>
  )
}
