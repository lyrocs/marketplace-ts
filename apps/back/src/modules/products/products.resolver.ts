import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ObjectType,
  Field,
  Float,
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { ProductsService } from './products.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { Public } from '../../common/decorators/public.decorator.js'
import { UserRole } from '@nextrade/types'
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

  @Field()
  status: string

  @Field({ nullable: true })
  category?: CategoryOutput

  @Field({ nullable: true })
  brand?: BrandOutput

  @Field(() => [ShopOutput], { defaultValue: [] })
  shops: ShopOutput[]

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
    return product as any
  }

  @Public()
  @Query(() => ProductsListOutput)
  async products(
    @Args({ name: 'name', nullable: true }) name?: string,
    @Args({ name: 'categoryId', type: () => Int, nullable: true }) categoryId?: number,
    @Args({ name: 'brandId', type: () => Int, nullable: true }) brandId?: number,
    @Args({ name: 'specIds', type: () => [Int], nullable: true }) specIds?: number[],
    @Args({ name: 'page', type: () => Int, defaultValue: 1 }) page?: number,
    @Args({ name: 'limit', type: () => Int, defaultValue: 12 }) limit?: number,
  ): Promise<ProductsListOutput> {
    return this.productsService.search({ name, categoryId, brandId, specIds, page, limit }) as any
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
    @Args({ name: 'description', nullable: true }) description?: string,
  ): Promise<ProductOutput> {
    const data: any = {}
    if (name !== undefined) data.name = name
    if (categoryId !== undefined) data.categoryId = categoryId
    if (description !== undefined) data.description = description
    return this.productsService.update(id, data) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteProduct(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.productsService.delete(id)
    return true
  }
}
