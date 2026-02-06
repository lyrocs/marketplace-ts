import { Resolver, Query, Mutation, Args, ObjectType, Field } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { UsersService } from './users.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'
import { Public } from '../../common/decorators/public.decorator.js'

@ObjectType()
export class UserProfileOutput {
  @Field()
  id: string

  @Field({ nullable: true })
  name?: string

  @Field()
  email: string

  @Field({ nullable: true })
  image?: string

  @Field()
  role: string

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}

@ObjectType()
export class UserStatsOutput {
  @Field()
  totalDeals: number

  @Field()
  publishedDeals: number

  @Field()
  soldDeals: number
}

@ObjectType()
export class PublicProfileOutput {
  @Field()
  id: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  image?: string

  @Field()
  createdAt: Date

  @Field()
  totalDeals: number

  @Field()
  publishedDeals: number

  @Field()
  soldDeals: number
}

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => UserProfileOutput)
  async myProfile(@CurrentUser() user: any): Promise<UserProfileOutput> {
    const profile = await this.usersService.findById(user.id)
    return profile as any
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserStatsOutput)
  async myStats(@CurrentUser() user: any): Promise<UserStatsOutput> {
    return this.usersService.getUserStats(user.id)
  }

  @Public()
  @Query(() => PublicProfileOutput, { nullable: true })
  async publicProfile(@Args({ name: 'id' }) id: string): Promise<PublicProfileOutput | null> {
    const profile = await this.usersService.getPublicProfile(id)
    return profile as any
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserProfileOutput)
  async updateProfile(
    @CurrentUser() user: any,
    @Args({ name: 'name', nullable: true }) name?: string,
    @Args({ name: 'image', nullable: true }) image?: string,
  ): Promise<UserProfileOutput> {
    const data: any = {}
    if (name !== undefined) data.name = name
    if (image !== undefined) data.image = image
    return this.usersService.updateProfile(user.id, data) as any
  }
}
