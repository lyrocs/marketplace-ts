import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { DiscussionsService } from './discussions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ObjectType()
export class DiscussionUserOutput {
  @Field()
  id: string

  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  image?: string

  @Field({ nullable: true })
  matrixLogin?: string
}

@ObjectType()
export class DiscussionDealOutput {
  @Field(() => Int)
  id: number

  @Field({ nullable: true })
  title?: string
}

@ObjectType()
export class DiscussionOutput {
  @Field(() => Int)
  id: number

  @Field()
  matrixRoomId: string

  @Field()
  deal: DiscussionDealOutput

  @Field()
  buyer: DiscussionUserOutput

  @Field()
  seller: DiscussionUserOutput

  @Field()
  hasUnread: boolean

  @Field()
  createdAt: Date
}

@ObjectType()
export class UnreadCountOutput {
  @Field(() => Int)
  count: number
}

@Resolver()
export class DiscussionsResolver {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [DiscussionOutput])
  async myDiscussions(@CurrentUser() user: any): Promise<DiscussionOutput[]> {
    const discussions = await this.discussionsService.findByUser(user.id)
    return discussions.map((d: any): any => ({
      id: d.id,
      matrixRoomId: d.matrixRoomId,
      createdAt: d.createdAt,
      deal: d.deal,
      buyer: d.buyer,
      seller: d.seller,
      hasUnread: d.statuses.length > 0 && d.statuses[0].newMessage,
    }))
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => DiscussionOutput, { nullable: true })
  async discussion(@Args({ name: 'id', type: () => Int }) id: number): Promise<DiscussionOutput | null> {
    const d = await this.discussionsService.findById(id)
    if (!d) return null
    return {
      id: d.id,
      matrixRoomId: d.matrixRoomId,
      createdAt: d.createdAt,
      deal: d.deal,
      buyer: d.buyer,
      seller: d.seller,
      hasUnread: false,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UnreadCountOutput)
  async unreadCount(@CurrentUser() user: any): Promise<UnreadCountOutput> {
    const count = await this.discussionsService.getUnreadCount(user.id)
    return { count }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => DiscussionOutput)
  async startDiscussion(
    @CurrentUser() user: any,
    @Args({ name: 'dealId', type: () => Int }) dealId: number,
  ): Promise<DiscussionOutput> {
    // Check existing discussion
    const existing = await this.discussionsService.findByDealAndBuyer(dealId, user.id)
    if (existing) {
      const d = await this.discussionsService.findById(existing.id)
      return {
        id: d!.id,
        matrixRoomId: d!.matrixRoomId,
        createdAt: d!.createdAt,
        deal: d!.deal,
        buyer: d!.buyer,
        seller: d!.seller,
        hasUnread: false,
      }
    }

    // Get deal seller
    const { prisma: db } = await import('@nextrade/database')
    const deal = await db.deal.findUnique({ where: { id: dealId }, select: { userId: true } })
    if (!deal) throw new Error('Deal not found')

    const discussion = await this.discussionsService.create({
      dealId,
      buyerId: user.id,
      sellerId: deal.userId,
    })

    const d = await this.discussionsService.findById(discussion.id)
    return {
      id: d!.id,
      matrixRoomId: d!.matrixRoomId,
      createdAt: d!.createdAt,
      deal: d!.deal,
      buyer: d!.buyer,
      seller: d!.seller,
      hasUnread: false,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async markDiscussionRead(
    @CurrentUser() user: any,
    @Args({ name: 'discussionId', type: () => Int }) discussionId: number,
  ): Promise<boolean> {
    await this.discussionsService.markRead(discussionId, user.id)
    return true
  }
}
