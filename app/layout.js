import './globals.css'
import AnnouncementBar from '../components/AnnouncementBar'
import TopNavigationBar from '../components/TopNavigationBar'
import Header from '../components/Header'
import ModernFooter from '../components/ModernFooter'
import DelayedSignupModal from '../components/DelayedSignupModal'
import { AuthProvider } from './providers/AuthProvider'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Spacecrafts Furniture - Premium Furniture Store Online India',
    template: '%s | Spacecrafts Furniture'
  },
  description: 'Shop premium furniture online at Spacecrafts Furniture. Wide selection of sofas, beds, dining sets, office furniture. Free delivery, best prices, 30-day returns. Premium quality guaranteed.',
  keywords: ['furniture online', 'buy furniture online', 'furniture store India', 'sofas online', 'beds online', 'office furniture', 'home furniture', 'premium furniture', 'furniture shopping'],
  authors: [{ name: 'Spacecrafts Furniture' }],
  creator: 'Spacecrafts Digital',
  publisher: 'Spacecrafts Furniture',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Spacecrafts Furniture',
    title: 'Spacecrafts Furniture - Premium Furniture Store Online India',
    description: 'Shop premium furniture online. Wide selection, best prices, free delivery across India.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Spacecrafts Furniture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spacecrafts Furniture - Premium Furniture Store',
    description: 'Shop premium furniture online. Wide selection, best prices, free delivery.',
    images: ['/og-image.jpg'],
    creator: '@spacecraftsfurn',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

function GTMSnippet(){
  const id = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'
  if (!id || id === 'GTM-XXXXXXX') return null
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'? '&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');` }} />
    </>
  )
}

function GTMNoScript(){
  const id = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'
  if (!id || id === 'GTM-XXXXXXX') return null
  return (
    <noscript>
      <iframe 
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0" 
        width="0" 
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <GTMSnippet />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <GTMNoScript />
          <AnnouncementBar />
          <TopNavigationBar />
          <Header />
          <main style={{ minHeight: '60vh' }}>
            {children}
          </main>
          <ModernFooter />
          <DelayedSignupModal />
        </AuthProvider>
      </body>
    </html>
  )
}
