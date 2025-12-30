import dynamic from 'next/dynamic'

const WishlistClient = dynamic(() => import('../../components/WishlistClient'), { ssr: false })

export default function WishlistPage(){
  return (
    <div className="container">
      <h1>Wishlist</h1>
      <WishlistClient />
    </div>
  )
}
