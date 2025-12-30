"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function WishlistClient(){
  const [items, setItems] = useState([])

  useEffect(()=>{
    const fetch = async ()=>{
      const userRes = await supabase.auth.getUser()
      const user = userRes.data?.user
      if (user) {
        const { data } = await supabase.from('wishlist_items').select('*, products(*)').eq('profile_id', user.id)
        setItems(data || [])
      } else {
        const ls = localStorage.getItem('wishlist')
        setItems(ls ? JSON.parse(ls) : [])
      }
    }
    fetch()
  }, [])

  const remove = async (id) => {
    const userRes = await supabase.auth.getUser()
    const user = userRes.data?.user
    if (user) {
      await supabase.from('wishlist_items').delete().eq('id', id).eq('profile_id', user.id)
      setItems(items.filter(i=>i.id !== id))
    } else {
      const newItems = items.filter(i=>i.id !== id)
      setItems(newItems)
      localStorage.setItem('wishlist', JSON.stringify(newItems))
    }
  }

  if (!items.length) return <div>Your wishlist is empty.</div>

  return (
    <ul>
      {items.map(i=> (
        <li key={i.id} style={{marginBottom:12}}>
          <div>{i.products?.name || i.name}</div>
          <button onClick={()=>remove(i.id)}>Remove</button>
        </li>
      ))}
    </ul>
  )
}
