import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  // Check if this is a GraphQL request
  const gqlContext = GqlExecutionContext.create(context)
  const ctx = gqlContext.getContext()

  // GraphQL context has req property
  if (ctx && ctx.req) {
    return ctx.req.user
  }

  // Fallback to HTTP context
  const request = context.switchToHttp().getRequest()
  return request.user
})
