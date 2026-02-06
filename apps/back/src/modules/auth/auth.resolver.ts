import { Resolver, Mutation, Args, ObjectType, Field, Query } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ObjectType()
export class UserOutput {
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
}

@ObjectType()
export class AuthPayloadOutput {
  @Field()
  accessToken: string

  @Field()
  user: UserOutput
}

@ObjectType()
export class SuccessOutput {
  @Field()
  success: boolean
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayloadOutput)
  async login(
    @Args({ name: 'email' }) email: string,
    @Args({ name: 'password' }) password: string,
  ): Promise<AuthPayloadOutput> {
    const user = await this.authService.validateLocalUser(email, password)
    return this.authService.login(user)
  }

  @Public()
  @Mutation(() => AuthPayloadOutput)
  async register(
    @Args({ name: 'name' }) name: string,
    @Args({ name: 'email' }) email: string,
    @Args({ name: 'password' }) password: string,
  ): Promise<AuthPayloadOutput> {
    return this.authService.register({ name, email, password })
  }

  @Public()
  @Mutation(() => SuccessOutput)
  async requestPasswordReset(@Args({ name: 'email' }) email: string): Promise<SuccessOutput> {
    return this.authService.requestPasswordReset(email)
  }

  @Public()
  @Mutation(() => SuccessOutput)
  async resetPassword(
    @Args({ name: 'token' }) token: string,
    @Args({ name: 'password' }) password: string,
  ): Promise<SuccessOutput> {
    return this.authService.resetPassword(token, password)
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserOutput)
  async me(@CurrentUser() user: any): Promise<UserOutput> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    }
  }
}
