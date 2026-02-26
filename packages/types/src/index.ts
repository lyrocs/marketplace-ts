// ============================================================================
// USER TYPES
// ============================================================================

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}


// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthPayload {
  user: User
  accessToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

// ============================================================================
// DEAL TYPES
// ============================================================================

export enum DealStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
}

export enum DealCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export interface DealFeature {
  label: string
  value: string
}

export interface Deal {
  id: number
  userId: string
  status: DealStatus
  price: number | null
  currency: string | null
  location: string | null
  title: string | null
  description: string | null
  images: string[]
  invoiceAvailable: boolean
  sellingReason: string | null
  canBeDelivered: boolean
  features: DealFeature[]
  condition: DealCondition
  reasonDeclined: string | null
  createdAt: Date
  updatedAt: Date
}

export interface DealProduct {
  id: number
  dealId: number
  productId: number
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateDealInput {
  title: string
  description: string
  location: string
  currency: string
  price: number
  invoiceAvailable?: boolean
  sellingReason?: string
  canBeDelivered?: boolean
  features?: DealFeature[]
  condition?: DealCondition
  products: { productId: number; quantity: number }[]
}

export interface UpdateDealInput extends Partial<CreateDealInput> {}

export interface UpdateDealStatusInput {
  status: DealStatus
  reason?: string
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: number
  name: string
  categoryId: number
  brandId: number | null
  images: string[]
  description: string | null
  features: Record<string, unknown> | null
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductInput {
  name: string
  categoryId: number
  brandId?: number
  images?: string[]
  description?: string
  features?: Record<string, unknown>
  status: string
}

export interface ProductSearchInput {
  name?: string
  categoryId?: number
  brandId?: number
  specIds?: number[]
  page?: number
  limit?: number
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: number
  name: string
  key: string
  image: string | null
  description: string | null
  parentId: number | null
}

export interface CreateCategoryInput {
  name: string
  key: string
  image?: string
  description?: string
  parentId?: number
}

// ============================================================================
// BRAND TYPES
// ============================================================================

export interface Brand {
  id: number
  name: string
}

export interface CreateBrandInput {
  name: string
}

// ============================================================================
// SPEC TYPES
// ============================================================================

export interface SpecType {
  id: number
  key: string
  label: string
  description: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface Spec {
  id: number
  specTypeId: number | null
  value: string
}

export interface CreateSpecTypeInput {
  key: string
  label: string
  description?: string
}

export interface CreateSpecInput {
  specTypeId: number
  value: string
}

// ============================================================================
// SHOP TYPES
// ============================================================================

export interface Shop {
  id: number
  productId: number
  url: string
  price: number | null
  currency: string | null
  available: boolean | null
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateShopInput {
  productId: number
  url: string
  price?: number
  currency?: string
  available?: boolean
  name: string
}

// ============================================================================
// DISCUSSION TYPES
// ============================================================================

export interface Discussion {
  id: number
  dealId: number
  buyerId: string
  sellerId: string
  createdAt: Date
  updatedAt: Date
}

export interface DiscussionStatus {
  id: number
  discussionId: number
  userId: string
  newMessage: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateDiscussionInput {
  dealId: number
  buyerId: string
  sellerId: string
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string
  discussionId: number
  senderId: string
  content: string
  createdAt: Date
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

export interface UploadResult {
  url: string
  key: string
}

export interface ImageUploadInput {
  file: any // Express.Multer.File or File from DOM
  folder?: string
}
