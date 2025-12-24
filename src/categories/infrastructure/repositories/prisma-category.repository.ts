import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  CategoryRecord,
  CategoryRepository,
  CreateCategoryData,
} from "../../application/ports/category-repository.js";

@injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  async create(data: CreateCategoryData): Promise<CategoryRecord> {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        parentId: data.parentId ?? null,
        companyId: data.companyId,
      },
    });

    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      companyId: category.companyId,
    };
  }

  async findById(id: string): Promise<CategoryRecord | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, parentId: true, companyId: true },
    });
    if (!category) return null;
    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      companyId: category.companyId,
    };
  }
}
