import { gql } from '@apollo/client'

// ============================================================================
// AUTH QUERIES & MUTATIONS
// ============================================================================

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        name
        email
        image
        role
        matrixLogin
        matrixPassword
      }
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      accessToken
      user {
        id
        name
        email
        image
        role
        matrixLogin
        matrixPassword
      }
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      image
      role
      matrixLogin
      matrixPassword
    }
  }
`

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
    }
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      success
    }
  }
`

// ============================================================================
// USER QUERIES
// ============================================================================

export const MY_PROFILE_QUERY = gql`
  query MyProfile {
    myProfile {
      id
      name
      email
      image
      role
      createdAt
      updatedAt
    }
  }
`

export const MY_STATS_QUERY = gql`
  query MyStats {
    myStats {
      totalDeals
      publishedDeals
      soldDeals
    }
  }
`

export const PUBLIC_PROFILE_QUERY = gql`
  query PublicProfile($id: String!) {
    publicProfile(id: $id) {
      id
      name
      image
      createdAt
      totalDeals
      publishedDeals
      soldDeals
    }
  }
`

export const USER_DEALS_QUERY = gql`
  query UserDeals($userId: String!) {
    userDeals(userId: $userId) {
      id
      title
      price
      currency
      images
      condition
      createdAt
      seller { id name image }
      products { productName categoryName }
    }
  }
`

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $image: String) {
    updateProfile(name: $name, image: $image) {
      id
      name
      email
      image
    }
  }
`

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      key
      image
      description
      parentId
      children {
        id
        name
        key
      }
      specTypes {
        id
        key
        label
      }
    }
  }
`

export const ROOT_CATEGORIES_QUERY = gql`
  query RootCategories {
    rootCategories {
      id
      name
      key
      image
      description
      children {
        id
        name
        key
        image
        description
      }
    }
  }
`

export const CATEGORY_BY_KEY_QUERY = gql`
  query CategoryByKey($key: String!) {
    categoryByKey(key: $key) {
      id
      name
      key
      description
      specTypes {
        id
        key
        label
      }
    }
  }
`

// Admin mutations
export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($name: String!, $key: String!, $image: String, $description: String, $parentId: Int) {
    createCategory(name: $name, key: $key, image: $image, description: $description, parentId: $parentId) {
      id
      name
      key
    }
  }
`

export const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: Int!, $name: String, $key: String, $image: String, $description: String) {
    updateCategory(id: $id, name: $name, key: $key, image: $image, description: $description) {
      id
      name
      key
    }
  }
`

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id)
  }
`

// ============================================================================
// BRAND QUERIES
// ============================================================================

export const BRANDS_QUERY = gql`
  query Brands {
    brands {
      id
      name
    }
  }
`

export const CREATE_BRAND_MUTATION = gql`
  mutation CreateBrand($name: String!) {
    createBrand(name: $name) {
      id
      name
    }
  }
`

export const UPDATE_BRAND_MUTATION = gql`
  mutation UpdateBrand($id: Int!, $name: String!) {
    updateBrand(id: $id, name: $name) {
      id
      name
    }
  }
`

export const DELETE_BRAND_MUTATION = gql`
  mutation DeleteBrand($id: Int!) {
    deleteBrand(id: $id)
  }
`

// ============================================================================
// SPEC QUERIES
// ============================================================================

export const SPEC_TYPES_QUERY = gql`
  query SpecTypes {
    specTypes {
      id
      key
      label
      description
      specs {
        id
        value
      }
    }
  }
`

export const SPECS_BY_TYPE_QUERY = gql`
  query SpecsByType($specTypeId: Int!) {
    specsByType(specTypeId: $specTypeId) {
      id
      value
    }
  }
`

export const CREATE_SPEC_TYPE_MUTATION = gql`
  mutation CreateSpecType($key: String!, $label: String!, $description: String) {
    createSpecType(key: $key, label: $label, description: $description) {
      id
      key
      label
    }
  }
`

export const CREATE_SPEC_MUTATION = gql`
  mutation CreateSpec($specTypeId: Int!, $value: String!) {
    createSpec(specTypeId: $specTypeId, value: $value) {
      id
      value
    }
  }
`

export const DELETE_SPEC_MUTATION = gql`
  mutation DeleteSpec($id: Int!) {
    deleteSpec(id: $id)
  }
`

export const DELETE_SPEC_TYPE_MUTATION = gql`
  mutation DeleteSpecType($id: Int!) {
    deleteSpecType(id: $id)
  }
`

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

export const PRODUCT_QUERY = gql`
  query Product($id: Int!) {
    product(id: $id) {
      id
      name
      categoryId
      brandId
      images
      description
      features
      status
      category { id name key }
      brand { id name }
      shops { id url price currency available name }
      specs { id value specType { id key label } }
      deals { id title price currency condition sellerName }
      createdAt
      updatedAt
    }
  }
`

export const ADMIN_PRODUCT_QUERY = gql`
  query AdminProduct($id: Int!) {
    adminProduct(id: $id) {
      id
      name
      categoryId
      brandId
      images
      description
      features
      status
      category { id name key }
      brand { id name }
      shops { id url price currency available name }
      specs { id value specType { id key label } }
      deals { id title price currency condition sellerName }
      createdAt
      updatedAt
    }
  }
`

export const PRODUCTS_QUERY = gql`
  query Products(
    $name: String
    $categoryId: Int
    $brandId: Int
    $specIds: [Int!]
    $minPrice: Float
    $maxPrice: Float
    $sortBy: String
    $sortOrder: String
    $page: Int
    $limit: Int
    $includeDrafts: Boolean
    $status: String
  ) {
    products(
      name: $name
      categoryId: $categoryId
      brandId: $brandId
      specIds: $specIds
      minPrice: $minPrice
      maxPrice: $maxPrice
      sortBy: $sortBy
      sortOrder: $sortOrder
      page: $page
      limit: $limit
      includeDrafts: $includeDrafts
      status: $status
    ) {
      data {
        id
        name
        categoryId
        images
        description
        status
        category { id name key }
        brand { id name }
        shops { price currency available }
        specs { id value specType { id key label } }
        deals { id title price currency condition sellerName }
      }
      meta { total page limit totalPages hasNextPage hasPreviousPage }
    }
  }
`

export const SUGGEST_PRODUCT_MUTATION = gql`
  mutation SuggestProduct($name: String!, $categoryId: Int!, $brandId: Int) {
    suggestProduct(name: $name, categoryId: $categoryId, brandId: $brandId) {
      id
      name
      categoryId
      brandId
      status
    }
  }
`

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($name: String!, $categoryId: Int!, $brandId: Int, $description: String) {
    createProduct(name: $name, categoryId: $categoryId, brandId: $brandId, description: $description) {
      id
      name
      categoryId
      brandId
      description
      status
    }
  }
`

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: Int!, $name: String, $categoryId: Int, $brandId: Int, $description: String, $features: [String!], $status: String) {
    updateProduct(id: $id, name: $name, categoryId: $categoryId, brandId: $brandId, description: $description, features: $features, status: $status) {
      id
      name
      categoryId
      brandId
      description
      features
      status
    }
  }
`

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: Int!) {
    deleteProduct(id: $id)
  }
`

export const REUPLOAD_PRODUCT_IMAGES_MUTATION = gql`
  mutation ReuploadProductImages($productId: Int!) {
    reuploadProductImages(productId: $productId) {
      id
      images
    }
  }
`

export const IMPORT_PRODUCTS_MUTATION = gql`
  mutation ImportProducts($json: String!) {
    importProducts(json: $json) {
      imported
      updated
      failed
      errors
    }
  }
`

export const UPDATE_PRODUCT_SPECS_MUTATION = gql`
  mutation UpdateProductSpecs($productId: Int!, $specIds: [Int!]!) {
    updateProductSpecs(productId: $productId, specIds: $specIds) {
      id
      specs { id value specType { id key label } }
    }
  }
`

export const ADD_PRODUCT_IMAGE_MUTATION = gql`
  mutation AddProductImage($productId: Int!, $imageUrl: String!) {
    addProductImage(productId: $productId, imageUrl: $imageUrl) {
      id
      images
    }
  }
`

export const DELETE_PRODUCT_IMAGE_MUTATION = gql`
  mutation DeleteProductImage($productId: Int!, $imageUrl: String!) {
    deleteProductImage(productId: $productId, imageUrl: $imageUrl) {
      id
      images
    }
  }
`

// ============================================================================
// DEAL QUERIES
// ============================================================================

export const DEAL_QUERY = gql`
  query Deal($id: Int!) {
    deal(id: $id) {
      id
      userId
      status
      price
      currency
      location
      title
      description
      images
      invoiceAvailable
      sellingReason
      canBeDelivered
      features { label value }
      condition
      reasonDeclined
      seller { id name image }
      products { productId quantity productName categoryName brandName }
      createdAt
      updatedAt
    }
  }
`

export const DEALS_QUERY = gql`
  query Deals($title: String, $categoryId: Int, $specIds: [Int!], $page: Int, $limit: Int) {
    deals(title: $title, categoryId: $categoryId, specIds: $specIds, page: $page, limit: $limit) {
      data {
        id
        status
        price
        currency
        title
        images
        condition
        seller { id name image }
        products { productId productName categoryName brandName quantity }
        createdAt
      }
      meta { total page limit totalPages hasNextPage hasPreviousPage }
    }
  }
`

export const RECENT_DEALS_QUERY = gql`
  query RecentDeals {
    recentDeals {
      id
      price
      currency
      title
      images
      condition
      seller { id name image }
      products { productName categoryName }
      createdAt
    }
  }
`

export const MY_DEALS_QUERY = gql`
  query MyDeals {
    myDeals {
      id
      status
      price
      currency
      title
      images
      reasonDeclined
      createdAt
      products { productName quantity }
    }
  }
`

export const CREATE_DEAL_DRAFT_MUTATION = gql`
  mutation CreateDealDraft {
    createDealDraft {
      id
      status
    }
  }
`

export const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal(
    $id: Int!
    $title: String
    $description: String
    $location: String
    $currency: String
    $price: Float
    $invoiceAvailable: Boolean
    $sellingReason: String
    $canBeDelivered: Boolean
    $features: [DealFeatureInput!]
    $condition: String
    $products: [DealProductInput!]
  ) {
    updateDeal(
      id: $id
      title: $title
      description: $description
      location: $location
      currency: $currency
      price: $price
      invoiceAvailable: $invoiceAvailable
      sellingReason: $sellingReason
      canBeDelivered: $canBeDelivered
      features: $features
      condition: $condition
      products: $products
    ) {
      id
      status
      title
      price
    }
  }
`

export const PUBLISH_DEAL_MUTATION = gql`
  mutation PublishDeal($id: Int!) {
    publishDeal(id: $id) {
      id
      status
    }
  }
`

export const MARK_DEAL_SOLD_MUTATION = gql`
  mutation MarkDealSold($id: Int!) {
    markDealSold(id: $id) {
      id
      status
    }
  }
`

export const ADMIN_UPDATE_DEAL_STATUS_MUTATION = gql`
  mutation AdminUpdateDealStatus($id: Int!, $status: String!, $reason: String) {
    adminUpdateDealStatus(id: $id, status: $status, reason: $reason) {
      id
      status
      reasonDeclined
    }
  }
`

export const ADD_DEAL_IMAGE_MUTATION = gql`
  mutation AddDealImage($dealId: Int!, $imageUrl: String!) {
    addDealImage(dealId: $dealId, imageUrl: $imageUrl) {
      id
      images
    }
  }
`

export const DELETE_DEAL_IMAGE_MUTATION = gql`
  mutation DeleteDealImage($dealId: Int!, $imageUrl: String!) {
    deleteDealImage(dealId: $dealId, imageUrl: $imageUrl) {
      id
      images
    }
  }
`

export const ADMIN_DEALS_QUERY = gql`
  query AdminDeals($status: String!, $page: Int, $limit: Int) {
    adminDeals(status: $status, page: $page, limit: $limit) {
      data {
        id
        status
        title
        price
        currency
        images
        condition
        reasonDeclined
        seller { id name image }
        products { productName quantity }
        createdAt
      }
      meta { total page limit totalPages hasNextPage hasPreviousPage }
    }
  }
`

// ============================================================================
// DISCUSSION QUERIES
// ============================================================================

export const MY_DISCUSSIONS_QUERY = gql`
  query MyDiscussions {
    myDiscussions {
      id
      matrixRoomId
      hasUnread
      deal { id title }
      buyer { id name image }
      seller { id name image }
      createdAt
    }
  }
`

export const DISCUSSION_QUERY = gql`
  query Discussion($id: Int!) {
    discussion(id: $id) {
      id
      matrixRoomId
      deal { id title }
      buyer { id name image matrixLogin }
      seller { id name image matrixLogin }
    }
  }
`

export const START_DISCUSSION_MUTATION = gql`
  mutation StartDiscussion($dealId: Int!) {
    startDiscussion(dealId: $dealId) {
      id
      matrixRoomId
      deal { id title }
    }
  }
`

export const MARK_DISCUSSION_READ_MUTATION = gql`
  mutation MarkDiscussionRead($discussionId: Int!) {
    markDiscussionRead(discussionId: $discussionId)
  }
`

export const UNREAD_COUNT_QUERY = gql`
  query UnreadCount {
    unreadCount {
      count
    }
  }
`
