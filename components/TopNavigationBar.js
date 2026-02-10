"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TopNavigationBar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { label: 'SELL ON PEPPERRY', href: '/sell' },
    { label: 'BECOME A FRANCHISEE', href: '/franchisee' },
    { label: 'BUY IN BULK', href: '/bulk-orders' },
    { label: 'GIFT CARDS', href: '/gift-cards' },
    { label: 'TRACK YOUR ORDER', href: '/track-order' },
    { label: 'CONTACT US', href: '/contact' }
  ]

  const handleContactClick = (e) => {
    e.preventDefault()
    router.push('/contact')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="top-nav-bar">
      <div className="nav-container">
        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Center: Menu Items */}
        <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {menuItems.slice(0, -1).map((item) => (
            <li key={item.href} className="nav-item">
              <Link href={item.href} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
          {/* Contact Us Button */}
          <li className="nav-item contact-item">
            <button
              className="nav-link contact-link"
              onClick={handleContactClick}
              aria-label="Contact Us"
            >
              {menuItems[menuItems.length - 1].label}
            </button>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .top-nav-bar {
          background: #f5f5f5;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
          position: sticky;
          top: 0;
          z-index: 999;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 50px;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          background: none;
          border: none;
          color: #2c3e50;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0.5rem 0;
          letter-spacing: 0.4px;
          position: relative;
          display: inline-block;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #e74c3c;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover {
          color: #e74c3c;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .contact-item .nav-link {
          background: #e74c3c;
          color: white;
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
        }

        .contact-item .nav-link::after {
          display: none;
        }

        .contact-item .nav-link:hover {
          background: #c0392b;
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
          transform: translateY(-2px);
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
        }

        .mobile-menu-toggle span {
          width: 25px;
          height: 3px;
          background: #2c3e50;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .nav-container {
            padding: 0 1.5rem;
            height: 50px;
          }

          .nav-menu {
            gap: 1.2rem;
          }

          .nav-link {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex;
          }

          .nav-container {
            height: 50px;
            padding: 0 1rem;
          }

          .nav-menu {
            position: absolute;
            top: 50px;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            gap: 0;
            padding: 1rem 0;
            border-bottom: 1px solid #f0f0f0;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }

          .nav-menu.mobile-open {
            max-height: 500px;
            overflow-y: auto;
          }

          .nav-item {
            width: 100%;
          }

          .nav-link {
            display: block;
            padding: 1rem 1.5rem;
            width: 100%;
            text-align: left;
          }

          .nav-link::after {
            display: none;
          }

          .nav-link:active {
            background: #f5f5f5;
          }

          .contact-item .nav-link {
            background: #e74c3c;
            color: white;
            margin: 0.75rem 1rem 0 1rem;
            width: calc(100% - 2rem);
            text-align: center;
            border-radius: 6px;
          }

          .contact-item .nav-link:hover {
            background: #c0392b;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            height: 50px;
          }

          .nav-menu {
            top: 50px;
          }

          .nav-link {
            font-size: 0.8rem;
            padding: 0.75rem 1rem;
          }

          .brand-link {
            font-size: 0.9rem;
            letter-spacing: 0.5px;
          }
        }
      `}</style>
    </nav>
  )
}
