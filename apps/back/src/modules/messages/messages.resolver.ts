import {
  Resolver,
  Query,
  Args,
  Int,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { MessagesService } from './messages.service.js';

@ObjectType()
export class MessageOutput {
  @Field()
  id: string;

  @Field(() => Int)
  discussionId: number;

  @Field()
  senderId: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class MessagesResult {
  @Field(() => [MessageOutput])
  messages: MessageOutput[];

  @Field({ nullable: true })
  nextCursor?: string;
}

@Resolver()
export class MessagesResolver {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => MessagesResult)
  async messages(
    @CurrentUser() user: any,
    @Args({ name: 'discussionId', type: () => Int }) discussionId: number,
    @Args({ name: 'cursor', nullable: true }) cursor?: string,
    @Args({ name: 'limit', type: () => Int, nullable: true }) limit?: number,
  ): Promise<MessagesResult> {
    // Verify participant
    const participants =
      await this.messagesService.getDiscussionParticipants(discussionId);
    if (
      !participants ||
      (participants.buyerId !== user.id &&
        participants.sellerId !== user.id)
    ) {
      throw new Error('Not a participant of this discussion');
    }

    return this.messagesService.findByDiscussion(
      discussionId,
      cursor || undefined,
      limit || 50,
    );
  }
}
