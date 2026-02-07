import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Float,
  ObjectType,
  Field,
  InputType,
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { DealsService } from './deals.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { Public } from '../../common/decorators/public.decorator.js'
import { UserRole } from '@marketplace/types'
import { PaginationMetaOutput } from '../../common/types/pagination.types.js'

@InputType()
export class DealFeatureInput {
  @Field()
  label: string

  @Field()
  value: string
}

@InputType()
export class DealProductInput {
  @Field(() => Int)
  productId: number

  @Field(() => Int)
  quantity: number
}

@ObjectType()
export class DealProductOutput {
  @Field(() => Int)
  productId: number

  @Field(() => Int)
  quantity: number

  @Field({ nullable: true })
  productName?: string

  @Field({ nullable: true })
  categoryName?: string

  @Field({ nullable: true })
  brandName?: string
}

@ObjectType()
export class DealSellerOutput {
  @Field()
  id: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  image?: string
}

@ObjectType()
export class DealFeatureOutput {
  @Field()
  label: string

  @Field()
  value: string
}

@ObjectType()
export class DealOutput {
  @Field(() => Int)
  id: number

  @Field()
  userId: string

  @Field()
  status: string

  @Field(() => Float, { nullable: true })
  price?: number

  @Field({ nullable: true })
  currency?: string

  @Field({ nullable: true })
  location?: string

  @Field({ nullable: true })
  title?: string

  @Field({ nullable: true })
  description?: string

  @Field(() => [String])
  images: string[]

  @Field()
  invoiceAvailable: boolean

  @Field({ nullable: true })
  sellingReason?: string

  @Field()
  canBeDelivered: boolean

  @Field(() => [DealFeatureOutput])
  features: DealFeatureOutput[]

  @Field()
  condition: string

  @Field({ nullable: true })
  reasonDeclined?: string

  @Field({ nullable: true })
  seller?: DealSellerOutput

  @Field(() => [DealProductOutput])
  products: DealProductOutput[]

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}

@ObjectType()
export class DealsListOutput {
  @Field(() => [DealOutput])
  data: DealOutput[]

  @Field(() => PaginationMetaOutput)
  meta: PaginationMetaOutput
}

function mapDeal(deal: any): DealOutput {
  return {
    id: deal.id,
    userId: deal.userId,
    status: deal.status,
    price: deal.price ? Number(deal.price) : undefined,
    currency: deal.currency,
    location: deal.location,
    title: deal.title,
    description: deal.description,
    images: deal.images || [],
    invoiceAvailable: deal.invoiceAvailable,
    sellingReason: deal.sellingReason,
    canBeDelivered: deal.canBeDelivered,
    features: deal.features || [],
    condition: deal.condition,
    reasonDeclined: deal.reasonDeclined,
    createdAt: deal.createdAt,
    updatedAt: deal.updatedAt,
    seller: deal.user ? { id: deal.user.id, name: deal.user.name, image: deal.user.image } : undefined,
    products: (deal.products || []).map((dp: any) => ({
      productId: dp.productId || dp.product?.id,
      quantity: dp.quantity,
      productName: dp.product?.name,
      categoryName: dp.product?.category?.name,
      brandName: dp.product?.brand?.name,
    })),
  }
}

@Resolver()
export class DealsResolver {
  constructor(private readonly dealsService: DealsService) {}

  @Public()
  @Query(() => DealOutput, { nullable: true })
  async deal(@Args({ name: 'id', type: () => Int }) id: number): Promise<DealOutput | null> {
    const deal = await this.dealsService.findById(id)
    return deal ? mapDeal(deal) : null
  }

  @Public()
  @Query(() => DealsListOutput)
  async deals(
    @Args({ name: 'title', nullable: true }) title?: string,
    @Args({ name: 'categoryId', type: () => Int, nullable: true }) categoryId?: number,
    @Args({ name: 'specIds', type: () => [Int], nullable: true }) specIds?: number[],
    @Args({ name: 'page', type: () => Int, defaultValue: 1 }) page?: number,
    @Args({ name: 'limit', type: () => Int, defaultValue: 12 }) limit?: number,
  ): Promise<DealsListOutput> {
    const result = await this.dealsService.search({ title, categoryId, specIds, page, limit })
    return { data: result.data.map(mapDeal), meta: result.meta }
  }

  @Public()
  @Query(() => [DealOutput])
  async recentDeals(): Promise<DealOutput[]> {
    const deals = await this.dealsService.findRecent()
    return deals.map(mapDeal)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [DealOutput])
  async myDeals(@CurrentUser() user: any): Promise<DealOutput[]> {
    const deals = await this.dealsService.findByUser(user.id)
    return deals.map(mapDeal)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => DealOutput)
  async createDealDraft(@CurrentUser() user: any): Promise<DealOutput> {
    const deal = await this.dealsService.createDraft(user.id)
    return mapDeal(deal)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => DealOutput)
  async updateDeal(
    @CurrentUser() user: any,
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'title', nullable: true }) title?: string,
    @Args({ name: 'description', nullable: true }) description?: string,
    @Args({ name: 'location', nullable: true }) location?: string,
    @Args({ name: 'currency', nullable: true }) currency?: string,
    @Args({ name: 'price', type: () => Float, nullable: true }) price?: number,
    @Args({ name: 'invoiceAvailable', nullable: true }) invoiceAvailable?: boolean,
    @Args({ name: 'sellingReason', nullable: true }) sellingReason?: string,
    @Args({ name: 'canBeDelivered', nullable: true }) canBeDelivered?: boolean,
    @Args({ name: 'features', type: () => [DealFeatureInput], nullable: true }) features?: DealFeatureInput[],
    @Args({ name: 'condition', nullable: true }) condition?: string,
    @Args({ name: 'products', type: () => [DealProductInput], nullable: true }) products?: DealProductInput[],
  ): Promise<DealOutput> {
    const deal = await this.dealsService.update(id, {
      title, description, location, currency, price,
      invoiceAvailable, sellingReason, canBeDelivered,
      features, condition, products,
    })
    return mapDeal(deal)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => DealOutput)
  async publishDeal(
    @CurrentUser() user: any,
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<DealOutput> {
    const deal = await this.dealsService.updateStatus(id, 'PUBLISHED')
    return mapDeal(deal)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => DealOutput)
  async adminUpdateDealStatus(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'status' }) status: string,
    @Args({ name: 'reason', nullable: true }) reason?: string,
  ): Promise<DealOutput> {
    const deal = await this.dealsService.updateStatus(id, status, reason)
    return mapDeal(deal)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => DealOutput)
  async addDealImage(
    @Args({ name: 'dealId', type: () => Int }) dealId: number,
    @Args({ name: 'imageUrl' }) imageUrl: string,
  ): Promise<DealOutput> {
    const deal = await this.dealsService.addImage(dealId, imageUrl)
    return mapDeal(deal)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => DealOutput)
  async deleteDealImage(
    @Args({ name: 'dealId', type: () => Int }) dealId: number,
    @Args({ name: 'imageUrl' }) imageUrl: string,
  ): Promise<DealOutput> {
    const deal = await this.dealsService.deleteImage(dealId, imageUrl)
    return mapDeal(deal)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => DealsListOutput)
  async adminDeals(
    @Args({ name: 'status', defaultValue: 'PUBLISHED' }) status: string,
    @Args({ name: 'page', type: () => Int, defaultValue: 1 }) page?: number,
    @Args({ name: 'limit', type: () => Int, defaultValue: 20 }) limit?: number,
  ): Promise<DealsListOutput> {
    const result = await this.dealsService.getPaginatedByStatus(status, page, limit)
    return { data: result.data.map(mapDeal), meta: result.meta }
  }
}
