import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class PaginationMetaOutput {
  @Field(() => Int)
  total: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number

  @Field(() => Int)
  totalPages: number

  @Field()
  hasNextPage: boolean

  @Field()
  hasPreviousPage: boolean
}
