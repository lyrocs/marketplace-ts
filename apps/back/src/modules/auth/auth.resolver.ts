import { Resolver, Mutation, Args, ObjectType, Field, Query } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { UsersService } from '../users/users.service.js'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js'
import { Public } from '../../common/decorators/public.decorator.js'
import { CurrentUser } from '../../common/decorators/current-user.decorator.js'

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
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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
    const fullUser = await this.usersService.findById(user.id)
    return {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      image: fullUser.image,
      role: fullUser.role,
    }
  }
}
