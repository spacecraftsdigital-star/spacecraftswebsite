"use client"
import { useEffect, useState } from 'react'

export default function AnnouncementBar(){
  const [closed, setClosed] = useState(false)

  useEffect(()=>{
    try{
      const saved = localStorage.getItem('announcementClosed')
      setClosed(saved === 'true')
    }catch(e){ }
  },[])

  function handleClose(){
    setClosed(true)
    try{ localStorage.setItem('announcementClosed','true') }catch(e){}
  }

  if(closed) return null

  return (
    <div className="announcement-bar">
      <div className="announcement-inner">
        <div className="announcement-text">Extra 20% off on All Home and Kitchen Orders — Use code: HOLIDAY20</div>
        <button className="announcement-close" onClick={handleClose} aria-label="Close announcement">✕</button>
      </div>
    </div>
  )
}
