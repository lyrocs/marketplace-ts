import { Module } from '@nestjs/common'
import { UsersService } from './users.service.js'
import { UsersResolver } from './users.resolver.js'

@Module({
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
