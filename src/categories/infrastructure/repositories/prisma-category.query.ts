import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  CategoryQuery,
  CategoryView,
} from "../../application/ports/category-query.js";

@injectable()
export class PrismaCategoryQuery implements CategoryQuery {
  async findByCompany(companyId: string): Promise<CategoryView[]> {
    const categories = await prisma.category.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        parentId: true,
        companyId: true,
      },
    });
    return categories;
  }
}
