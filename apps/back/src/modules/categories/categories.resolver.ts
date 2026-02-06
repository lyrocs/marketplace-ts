import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { UserRole } from '@nextrade/types'

@ObjectType()
export class SpecTypeInCategoryOutput {
  @Field(() => Int)
  id: number

  @Field()
  key: string

  @Field()
  label: string
}

@ObjectType()
export class CategoryTreeOutput {
  @Field(() => Int)
  id: number

  @Field()
  name: string

  @Field()
  key: string

  @Field({ nullable: true })
  image?: string

  @Field({ nullable: true })
  description?: string

  @Field(() => Int, { nullable: true })
  parentId?: number

  @Field(() => [CategoryTreeOutput], { defaultValue: [] })
  children: CategoryTreeOutput[]

  @Field(() => [SpecTypeInCategoryOutput], { defaultValue: [] })
  specTypes: SpecTypeInCategoryOutput[]
}

@Resolver()
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Query(() => [CategoryTreeOutput])
  async categories(): Promise<CategoryTreeOutput[]> {
    const cats = await this.categoriesService.findAll()
    return cats.map((c: any): any => ({
      ...c,
      specTypes: c.specTypes.map((cst: any): any => cst.specType),
    })) as any
  }

  @Public()
  @Query(() => [CategoryTreeOutput])
  async rootCategories(): Promise<CategoryTreeOutput[]> {
    return this.categoriesService.getRootCategories() as any
  }

  @Public()
  @Query(() => CategoryTreeOutput, { nullable: true })
  async category(@Args({ name: 'id', type: () => Int }) id: number): Promise<CategoryTreeOutput | null> {
    const cat = await this.categoriesService.findById(id)
    if (!cat) return null
    return {
      ...cat,
      specTypes: cat.specTypes.map((cst: any): any => cst.specType),
    } as any
  }

  @Public()
  @Query(() => CategoryTreeOutput, { nullable: true })
  async categoryByKey(@Args({ name: 'key' }) key: string): Promise<CategoryTreeOutput | null> {
    const cat = await this.categoriesService.findByKey(key)
    if (!cat) return null
    return {
      ...cat,
      specTypes: cat.specTypes.map((cst: any): any => cst.specType),
    } as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => CategoryTreeOutput)
  async createCategory(
    @Args({ name: 'name' }) name: string,
    @Args({ name: 'key' }) key: string,
    @Args({ name: 'image', nullable: true }) image?: string,
    @Args({ name: 'description', nullable: true }) description?: string,
    @Args({ name: 'parentId', type: () => Int, nullable: true }) parentId?: number,
  ): Promise<CategoryTreeOutput> {
    return this.categoriesService.create({ name, key, image, description, parentId }) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => CategoryTreeOutput)
  async updateCategory(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args({ name: 'name', nullable: true }) name?: string,
    @Args({ name: 'key', nullable: true }) key?: string,
    @Args({ name: 'image', nullable: true }) image?: string,
    @Args({ name: 'description', nullable: true }) description?: string,
  ): Promise<CategoryTreeOutput> {
    const data: any = {}
    if (name !== undefined) data.name = name
    if (key !== undefined) data.key = key
    if (image !== undefined) data.image = image
    if (description !== undefined) data.description = description
    return this.categoriesService.update(id, data) as any
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async deleteCategory(@Args({ name: 'id', type: () => Int }) id: number): Promise<boolean> {
    await this.categoriesService.delete(id)
    return true
  }
}
