import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { BrandsService } from './brands.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { Roles } from '../../common/decorators/roles.decorator.js'
import { Public } from '../../common/decorators/public.decorator.js'
import { UserRole } from '@marketplace/types'

@ObjectType()
export class BrandGqlOutput {
  @Field(() => Int)
  id: number

  @Field()
  name: string
}

@Resolver()
export class BrandsResolver {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Query(() => [BrandGqlOutput])
  async brands(): Promise<BrandGqlOutput[]> {
    return this.brandsService.findAll()
  }

  @Public()
  @Query(() => BrandGqlOutput, { nullable: true })
  async brand(@Args({ name: 'id', type: () => Int }) id: number): Promise<BrandGqlOutput | null> {
    return this.brandsService.findById(id)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => BrandGqlOutput)
  async createBrand(@Args({ name: 'name' }) name: string): Promise<BrandGqlOutput> {
    return this.brandsService.create(name)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => BrandGqlOutput)
  async updateBrand(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'name' }) name: string,
  ): Promise<BrandGqlOutput> {
    return this.brandsService.update(id, name)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteBrand(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.brandsService.delete(id)
    return true
  }
}
