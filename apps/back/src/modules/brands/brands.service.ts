import { Injectable } from '@nestjs/common'
import { prisma } from '@nextrade/database'

@Injectable()
export class BrandsService {
  async findAll(): Promise<any> {
    return prisma.brand.findMany({ orderBy: { name: 'asc' } })
  }

  async findById(id: number): Promise<any> {
    return prisma.brand.findUnique({ where: { id } })
  }

  async findByName(name: string): Promise<any> {
    return prisma.brand.findUnique({ where: { name } })
  }

  async create(name: string): Promise<any> {
    return prisma.brand.create({ data: { name } })
  }

  async update(id: number, name: string): Promise<any> {
    return prisma.brand.update({ where: { id }, data: { name } })
  }

  async delete(id: number): Promise<any> {
    return prisma.brand.delete({ where: { id } })
  }
}
