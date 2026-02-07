import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class CategoriesService {
  async findAll(): Promise<any> {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        specTypes: { include: { specType: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<any> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        specTypes: { include: { specType: true } },
      },
    });
  }

  async findByKey(key: string): Promise<any> {
    return prisma.category.findUnique({
      where: { key },
      include: {
        parent: true,
        children: true,
        specTypes: { include: { specType: true } },
      },
    });
  }

  async getRootCategories(): Promise<any> {
    return prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    name: string;
    key: string;
    image?: string;
    description?: string;
    parentId?: number;
  }): Promise<any> {
    return prisma.category.create({ data });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      key: string;
      image: string;
      description: string;
      parentId: number | null;
    }>,
  ): Promise<any> {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: number): Promise<any> {
    return prisma.category.delete({ where: { id } });
  }

  async addSpecType(categoryId: number, specTypeId: number): Promise<any> {
    return prisma.categorySpecType.create({
      data: { categoryId, specTypeId },
    });
  }

  async removeSpecType(categoryId: number, specTypeId: number): Promise<any> {
    return prisma.categorySpecType.delete({
      where: { categoryId_specTypeId: { categoryId, specTypeId } },
    });
  }
}
