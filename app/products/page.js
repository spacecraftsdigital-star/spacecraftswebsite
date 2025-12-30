import { createSupabaseServerClient } from '../../lib/supabaseClient'
import ProductsClient from '../../components/ProductsClient'

export const metadata = {
  title: 'All Products - Spacecrafts Furniture',
  description: 'Browse our complete collection of premium furniture. Shop sofas, beds, dining sets, office furniture, and more. Quality furniture for every room.',
  openGraph: {
    title: 'All Products - Spacecrafts Furniture',
    description: 'Browse our complete collection of premium furniture',
  }
}

export default async function ProductsPage({ searchParams }) {
  let products = []
  let categories = []
  let brands = []
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Fetch categories for filter
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name')
    categories = categoriesData || []
    
    // Fetch brands for filter
    const { data: brandsData } = await supabase
      .from('brands')
      .select('id, name, slug')
      .order('name')
    brands = brandsData || []
    
    // Build query based on filters
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name, slug)
      `)
      .gte('stock', 1) // Only show in-stock products
    
    // Filter by category
    if (searchParams?.category) {
      const category = categories.find(c => c.slug === searchParams.category)
      if (category) {
        query = query.eq('category_id', category.id)
      }
    }
    
    // Filter by brand
    if (searchParams?.brand) {
      const brand = brands.find(b => b.slug === searchParams.brand)
      if (brand) {
        query = query.eq('brand_id', brand.id)
      }
    }
    
    // Filter by price range
    if (searchParams?.minPrice) {
      query = query.gte('price', parseFloat(searchParams.minPrice))
    }
    if (searchParams?.maxPrice) {
      query = query.lte('price', parseFloat(searchParams.maxPrice))
    }
    
    // Search query
    if (searchParams?.q) {
      query = query.or(`name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,tags.cs.{${searchParams.q}}`)
    }
    
    // Sort
    const sortBy = searchParams?.sort || 'rating-desc'
    switch (sortBy) {
      case 'price-asc':
        query = query.order('price', { ascending: true })
        break
      case 'price-desc':
        query = query.order('price', { ascending: false })
        break
      case 'name-asc':
        query = query.order('name', { ascending: true })
        break
      case 'rating-desc':
      default:
        query = query.order('rating', { ascending: false })
    }
    
    const { data } = await query
    products = data || []
    
    // Fetch product images for each product
    if (products.length > 0) {
      const productIds = products.map(p => p.id)
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('position')
      
      // Attach images to products
      products = products.map(product => ({
        ...product,
        images: imagesData?.filter(img => img.product_id === product.id) || []
      }))
    }
    
  } catch (error) {
    console.error('Error fetching products:', error)
  }
  
  return (
    <ProductsClient 
      initialProducts={products} 
      categories={categories}
      brands={brands}
      searchParams={searchParams}
    />
  )
}
