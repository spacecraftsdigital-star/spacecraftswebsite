import dynamic from 'next/dynamic'

const CartClient = dynamic(() => import('../../components/CartClient'), { ssr: false })

export default function CartPage() {
  return (
    <div className="container">
      <h1>Your Cart</h1>
      <CartClient />
    </div>
  )
}
