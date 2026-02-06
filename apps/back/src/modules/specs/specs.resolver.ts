import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { SpecsService } from './specs.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { UserRole } from '@nextrade/types'

@ObjectType()
export class SpecTypeGqlOutput {
  @Field(() => Int)
  id: number

  @Field()
  key: string

  @Field()
  label: string

  @Field({ nullable: true })
  description?: string

  @Field(() => [SpecGqlOutput], { defaultValue: [] })
  specs: SpecGqlOutput[]
}

@ObjectType()
export class SpecGqlOutput {
  @Field(() => Int)
  id: number

  @Field(() => Int, { nullable: true })
  specTypeId?: number

  @Field()
  value: string
}

@Resolver()
export class SpecsResolver {
  constructor(private readonly specsService: SpecsService) {}

  @Public()
  @Query(() => [SpecTypeGqlOutput])
  async specTypes(): Promise<SpecTypeGqlOutput[]> {
    return this.specsService.findAllSpecTypes() as any
  }

  @Public()
  @Query(() => SpecTypeGqlOutput, { nullable: true })
  async specType(@Args({ name: 'id', type: () => Int }) id: number): Promise<SpecTypeGqlOutput | null> {
    return this.specsService.findSpecTypeById(id) as any
  }

  @Public()
  @Query(() => [SpecGqlOutput])
  async specsByType(@Args({ name: 'specTypeId', type: () => Int }) specTypeId: number): Promise<SpecGqlOutput[]> {
    return this.specsService.findSpecsByTypeId(specTypeId)
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => SpecTypeGqlOutput)
  async createSpecType(
    @Args({ name: 'key' }) key: string,
    @Args({ name: 'label' }) label: string,
    @Args({ name: 'description', nullable: true }) description?: string,
  ): Promise<SpecTypeGqlOutput> {
    return this.specsService.createSpecType({ key, label, description }) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => SpecTypeGqlOutput)
  async updateSpecType(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'key', nullable: true }) key?: string,
    @Args({ name: 'label', nullable: true }) label?: string,
    @Args({ name: 'description', nullable: true }) description?: string,
  ): Promise<SpecTypeGqlOutput> {
    const data: any = {}
    if (key !== undefined) data.key = key
    if (label !== undefined) data.label = label
    if (description !== undefined) data.description = description
    return this.specsService.updateSpecType(id, data) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteSpecType(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.specsService.deleteSpecType(id)
    return true
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => SpecGqlOutput)
  async createSpec(
    @Args({ name: 'specTypeId', type: () => Int }) specTypeId: number,
    @Args({ name: 'value' }) value: string,
  ): Promise<SpecGqlOutput> {
    return this.specsService.createSpec({ specTypeId, value })
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteSpec(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.specsService.deleteSpec(id)
    return true
  }
}
