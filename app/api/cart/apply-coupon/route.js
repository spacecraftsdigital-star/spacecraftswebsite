import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request) {
  try {
    const { coupon_code, user_id } = await request.json()

    if (!coupon_code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate coupon code (only HOLIDAY20 is valid)
    if (coupon_code.toUpperCase() !== 'HOLIDAY20') {
      return NextResponse.json({ 
        error: 'Invalid coupon code',
        success: false 
      }, { status: 400 })
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, get the profile_id from user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ 
        error: 'User not found',
        success: false 
      }, { status: 404 })
    }

    // Check if user has any completed orders (first-time order check)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('profile_id', profile.id)
      .eq('status', 'completed')

    if (ordersError) {
      console.error('Error checking orders:', ordersError)
      return NextResponse.json({ 
        error: 'Failed to validate coupon',
        success: false 
      }, { status: 500 })
    }

    // If user has completed orders, coupon is not valid
    if (orders && orders.length > 0) {
      return NextResponse.json({ 
        error: 'This coupon is only valid for first-time orders',
        success: false 
      }, { status: 400 })
    }

    // Coupon is valid
    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon_code: 'HOLIDAY20',
      discount_percentage: 10
    })

  } catch (error) {
    console.error('Error applying coupon:', error)
    return NextResponse.json({ 
      error: 'An error occurred while applying coupon',
      success: false 
    }, { status: 500 })
  }
}
