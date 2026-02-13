import { fetchGraphQL } from '@/lib/graphql-server'
import { CATEGORIES_QUERY, BRANDS_QUERY, SPEC_TYPES_QUERY } from '@/graphql/queries'
import { ProductListing } from '@/components/products/product-listing'

export default async function AllProductsPage() {
  const [categoriesData, brandsData, specsData] = await Promise.all([
    fetchGraphQL(CATEGORIES_QUERY),
    fetchGraphQL(BRANDS_QUERY),
    fetchGraphQL(SPEC_TYPES_QUERY),
  ])

  return (
    <ProductListing
      categories={categoriesData.categories || []}
      brands={brandsData.brands || []}
      specTypes={specsData.specTypes || []}
    />
  )
}
