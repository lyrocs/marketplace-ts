import { Injectable } from '@nestjs/common';
import { prisma } from '@marketplace/database';

@Injectable()
export class SpecsService {
  // SpecTypes
  async findAllSpecTypes(): Promise<any> {
    return prisma.specType.findMany({
      include: { specs: true },
      orderBy: { label: 'asc' },
    });
  }

  async findSpecTypeById(id: number): Promise<any> {
    return prisma.specType.findUnique({
      where: { id },
      include: { specs: true },
    });
  }

  async createSpecType(data: {
    key: string;
    label: string;
    description?: string;
  }): Promise<any> {
    return prisma.specType.create({ data });
  }

  async updateSpecType(
    id: number,
    data: Partial<{ key: string; label: string; description: string }>,
  ): Promise<any> {
    return prisma.specType.update({ where: { id }, data });
  }

  async deleteSpecType(id: number): Promise<any> {
    return prisma.specType.delete({ where: { id } });
  }

  // Specs
  async findSpecsByTypeId(specTypeId: number): Promise<any> {
    return prisma.spec.findMany({
      where: { specTypeId },
      orderBy: { value: 'asc' },
    });
  }

  async createSpec(data: { specTypeId: number; value: string }): Promise<any> {
    return prisma.spec.create({ data });
  }

  async deleteSpec(id: number): Promise<any> {
    return prisma.spec.delete({ where: { id } });
  }

  // Product Specs
  async getProductSpecs(productId: number): Promise<any> {
    return prisma.productSpec.findMany({
      where: { productId },
      include: { spec: { include: { specType: true } } },
    });
  }

  async addProductSpec(productId: number, specId: number): Promise<any> {
    return prisma.productSpec.create({ data: { productId, specId } });
  }

  async removeProductSpec(productId: number, specId: number): Promise<any> {
    return prisma.productSpec.delete({
      where: { productId_specId: { productId, specId } },
    });
  }
}
