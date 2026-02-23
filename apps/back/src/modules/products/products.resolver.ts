import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ObjectType,
  Field,
  Float,
  InputType,
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { ProductsService } from './products.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { Public } from '../../common/decorators/public.decorator.js'
import { UserRole } from '@marketplace/types'
import { PaginationMetaOutput } from '../../common/types/pagination.types.js'

@ObjectType()
export class SpecTypeOutput {
  @Field(() => Int)
  id: number

  @Field()
  key: string

  @Field()
  label: string
}

@ObjectType()
export class SpecOutput {
  @Field(() => Int)
  id: number

  @Field()
  value: string

  @Field({ nullable: true })
  specType?: SpecTypeOutput
}

@ObjectType()
export class ShopOutput {
  @Field(() => Int)
  id: number

  @Field()
  url: string

  @Field(() => Float, { nullable: true })
  price?: number

  @Field({ nullable: true })
  currency?: string

  @Field({ nullable: true })
  available?: boolean

  @Field()
  name: string
}

@ObjectType()
export class CategoryOutput {
  @Field(() => Int)
  id: number

  @Field()
  name: string

  @Field()
  key: string

  @Field({ nullable: true })
  parentId?: number
}

@ObjectType()
export class BrandOutput {
  @Field(() => Int)
  id: number

  @Field()
  name: string
}

@ObjectType()
export class ProductDealOutput {
  @Field(() => Int)
  id: number

  @Field({ nullable: true })
  title?: string

  @Field(() => Float, { nullable: true })
  price?: number

  @Field({ nullable: true })
  currency?: string

  @Field({ nullable: true })
  condition?: string

  @Field({ nullable: true })
  sellerName?: string
}

@ObjectType()
export class ProductOutput {
  @Field(() => Int)
  id: number

  @Field()
  name: string

  @Field()
  categoryId: number

  @Field(() => Int, { nullable: true })
  brandId?: number

  @Field(() => [String])
  images: string[]

  @Field({ nullable: true })
  description?: string

  @Field(() => [String], { defaultValue: [] })
  features: string[]

  @Field()
  status: string

  @Field({ nullable: true })
  category?: CategoryOutput

  @Field({ nullable: true })
  brand?: BrandOutput

  @Field(() => [ShopOutput], { defaultValue: [] })
  shops: ShopOutput[]

  @Field(() => [SpecOutput], { defaultValue: [] })
  specs: SpecOutput[]

  @Field(() => [ProductDealOutput], { defaultValue: [] })
  deals: ProductDealOutput[]

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}

@ObjectType()
export class ProductsListOutput {
  @Field(() => [ProductOutput])
  data: ProductOutput[]

  @Field()
  meta: PaginationMetaOutput
}

@Resolver()
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Query(() => ProductOutput, { nullable: true })
  async product(@Args({ name: 'id', type: () => Int }) id: number): Promise<ProductOutput | null> {
    const product = await this.productsService.findById(id)
    if (!product || product.status !== 'active') return null
    return product as any
  }

  @Public()
  @Query(() => ProductsListOutput)
  async products(
    @Args({ name: 'name', nullable: true }) name?: string,
    @Args({ name: 'categoryId', type: () => Int, nullable: true }) categoryId?: number,
    @Args({ name: 'brandId', type: () => Int, nullable: true }) brandId?: number,
    @Args({ name: 'specIds', type: () => [Int], nullable: true }) specIds?: number[],
    @Args({ name: 'minPrice', type: () => Float, nullable: true }) minPrice?: number,
    @Args({ name: 'maxPrice', type: () => Float, nullable: true }) maxPrice?: number,
    @Args({ name: 'sortBy', nullable: true, defaultValue: 'createdAt' }) sortBy?: string,
    @Args({ name: 'sortOrder', nullable: true, defaultValue: 'desc' }) sortOrder?: string,
    @Args({ name: 'page', type: () => Int, defaultValue: 1 }) page?: number,
    @Args({ name: 'limit', type: () => Int, defaultValue: 12 }) limit?: number,
    @Args({ name: 'includeDrafts', nullable: true }) includeDrafts?: boolean,
    @Args({ name: 'status', nullable: true }) status?: string,
  ): Promise<ProductsListOutput> {
    return this.productsService.search({
      name,
      categoryId,
      brandId,
      specIds,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      page,
      limit,
      includeDrafts,
      status,
    }) as any
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ProductOutput)
  async suggestProduct(
    @Args({ name: 'name' }) name: string,
    @Args({ name: 'categoryId', type: () => Int }) categoryId: number,
    @Args({ name: 'brandId', type: () => Int, nullable: true }) brandId?: number,
  ): Promise<ProductOutput> {
    return this.productsService.create({
      name,
      categoryId,
      brandId,
      status: 'draft',
    }) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async createProduct(
    @Args({ name: 'name' }) name: string,
    @Args({ name: 'categoryId', type: () => Int }) categoryId: number,
    @Args({ name: 'brandId', type: () => Int, nullable: true }) brandId?: number,
    @Args({ name: 'description', nullable: true }) description?: string,
  ): Promise<ProductOutput> {
    return this.productsService.create({
      name,
      categoryId,
      brandId,
      description,
      status: 'ACTIVE',
    }) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async updateProduct(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'name', nullable: true }) name?: string,
    @Args({ name: 'categoryId', type: () => Int, nullable: true }) categoryId?: number,
    @Args({ name: 'brandId', type: () => Int, nullable: true }) brandId?: number,
    @Args({ name: 'description', nullable: true }) description?: string,
    @Args({ name: 'features', type: () => [String], nullable: true }) features?: string[],
    @Args({ name: 'status', nullable: true }) status?: string,
  ): Promise<ProductOutput> {
    const data: any = {}
    if (name !== undefined) data.name = name
    if (categoryId !== undefined) data.categoryId = categoryId
    if (brandId !== undefined) data.brandId = brandId
    if (description !== undefined) data.description = description
    if (features !== undefined) data.features = features
    if (status !== undefined) data.status = status
    return this.productsService.update(id, data) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteProduct(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.productsService.delete(id)
    return true
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async addProductSpec(
    @Args({ name: 'productId', type: () => Int }) productId: number,
    @Args({ name: 'specId', type: () => Int }) specId: number,
  ): Promise<ProductOutput> {
    return this.productsService.addSpec(productId, specId) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async removeProductSpec(
    @Args({ name: 'productId', type: () => Int }) productId: number,
    @Args({ name: 'specId', type: () => Int }) specId: number,
  ): Promise<ProductOutput> {
    return this.productsService.removeSpec(productId, specId) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async updateProductSpecs(
    @Args({ name: 'productId', type: () => Int }) productId: number,
    @Args({ name: 'specIds', type: () => [Int] }) specIds: number[],
  ): Promise<ProductOutput> {
    return this.productsService.updateSpecs(productId, specIds) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async addProductImage(
    @Args({ name: 'productId', type: () => Int }) productId: number,
    @Args({ name: 'imageUrl' }) imageUrl: string,
  ): Promise<ProductOutput> {
    return this.productsService.addImage(productId, imageUrl) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async deleteProductImage(
    @Args({ name: 'productId', type: () => Int }) productId: number,
    @Args({ name: 'imageUrl' }) imageUrl: string,
  ): Promise<ProductOutput> {
    return this.productsService.deleteImage(productId, imageUrl) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ProductOutput)
  async reuploadProductImages(
    @Args({ name: 'productId', type: () => Int }) productId: number,
  ): Promise<ProductOutput> {
    return this.productsService.reuploadImages(productId) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => ImportResultOutput)
  async importProducts(
    @Args({ name: 'json' }) json: string,
  ): Promise<ImportResultOutput> {
    return this.productsService.importFromJson(json)
  }
}

@ObjectType()
export class ImportResultOutput {
  @Field(() => Int)
  imported: number

  @Field(() => Int)
  updated: number

  @Field(() => Int)
  failed: number

  @Field(() => [String])
  errors: string[]
}
