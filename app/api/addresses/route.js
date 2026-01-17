import { NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '../../../lib/supabaseClient'

// GET - Fetch all addresses for user
export async function GET(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('profile_id', profile.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
    }

    return NextResponse.json({ success: true, addresses: addresses || [] })
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// POST - Create new address
export async function POST(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      full_name, 
      phone, 
      address_line1, 
      address_line2, 
      city, 
      state, 
      postal_code, 
      is_default 
    } = body

    // Validate required fields
    if (!full_name || !phone || !address_line1 || !city || !state || !postal_code) {
      return NextResponse.json({ 
        error: 'All required fields must be provided' 
      }, { status: 400 })
    }

    // Check address count limit (max 4)
    const { count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    if (count >= 4) {
      return NextResponse.json({ 
        error: 'Maximum 4 addresses allowed. Please delete an address first.' 
      }, { status: 400 })
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('profile_id', profile.id)
    }

    // Create new address
    const { data: newAddress, error } = await supabase
      .from('addresses')
      .insert({
        profile_id: profile.id,
        full_name,
        phone,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        postal_code,
        is_default: is_default || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      address: newAddress,
      message: 'Address added successfully' 
    })
  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// PUT - Update address
export async function PUT(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      id,
      full_name, 
      phone, 
      address_line1, 
      address_line2, 
      city, 
      state, 
      postal_code, 
      is_default 
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // If this is set as default, unset other defaults
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('profile_id', profile.id)
        .neq('id', id)
    }

    // Update address
    const { data: updatedAddress, error } = await supabase
      .from('addresses')
      .update({
        full_name,
        phone,
        address_line1,
        address_line2: address_line2 || null,
        city,
        state,
        postal_code,
        is_default: is_default || false
      })
      .eq('id', id)
      .eq('profile_id', profile.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      address: updatedAddress,
      message: 'Address updated successfully' 
    })
  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

// DELETE - Delete address
export async function DELETE(request) {
  try {
    const supabase = createSupabaseRouteHandlerClient(request)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('id')

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('profile_id', profile.id)

    if (error) {
      console.error('Error deleting address:', error)
      return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Address deleted successfully' 
    })
  } catch (error) {
    console.error('Address deletion error:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
