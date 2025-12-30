"use client"
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../app/providers/AuthProvider'

export default function Header(){
  const [query, setQuery] = useState('')
  const { user, profile, isAuthenticated, signOut, loading } = useAuth()

  const displayName = profile?.full_name || user?.email || 'Account'

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          <Link href="/" className="logo-link">
            <Image src="/logo.svg" alt="Logo" width={140} height={40} priority />
          </Link>
        </div>

        <div className="header-center">
          <div className="search-wrap">
            <input
              value={query}
              onChange={e=>setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search"
            />
            <button className="search-btn" aria-label="Search">🔍</button>
          </div>
        </div>

        <div className="header-right">
          <nav className="top-nav">
            <Link href="/products">Furniture</Link>
            <Link href="/store-locator">Stores</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/cart" className="cart-link">Cart 🛒</Link>
          </nav>

          <div className="auth-area">
            {loading ? (
              <span className="auth-loading">Loading...</span>
            ) : isAuthenticated ? (
              <div className="auth-user">
                <span className="auth-name">{displayName}</span>
                <button className="auth-btn" onClick={signOut}>Logout</button>
              </div>
            ) : (
              <Link href="/login" className="auth-btn">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
