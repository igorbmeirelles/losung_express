import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import { CATEGORY_DEPENDENCY_TOKENS } from "../../tokens.js";
import type { CategoryRepository } from "../ports/category-repository.js";
import { CompanyRole } from "../../../companies/domain/company-role.enum.js";

export interface CreateCategoryInput {
  name: string;
  parentId?: string | null;
  user: {
    companyId: string;
    memberships: Array<{ role: string; branchId: string | null }>;
  };
}

export interface CreateCategoryOutput {
  categoryId: string;
}

export type CreateCategoryError =
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "INVALID_PARENT"
  | "CROSS_COMPANY"
  | "CYCLIC_TREE"
  | "UNEXPECTED";

@injectable()
export class CreateCategoryUseCase {
  constructor(
    @inject(CATEGORY_DEPENDENCY_TOKENS.categoryRepository)
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(
    input: CreateCategoryInput
  ): Promise<Result<CreateCategoryOutput, CreateCategoryError>> {
    const validation = schema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    if (!this.isAuthorized(validation.data.user.memberships)) {
      return fail("UNAUTHORIZED");
    }

    const parentId = validation.data.parentId ?? null;
    if (parentId) {
      const parent = await this.categoryRepository.findById(parentId);
      if (!parent) return fail("INVALID_PARENT");
      if (parent.companyId !== validation.data.user.companyId) {
        return fail("CROSS_COMPANY");
      }
      const cyclic = await this.hasCycle(parentId);
      if (cyclic) return fail("CYCLIC_TREE");
    }

    try {
      const category = await this.categoryRepository.create({
        name: validation.data.name,
        parentId,
        companyId: validation.data.user.companyId,
      });

      return ok({ categoryId: category.id });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }

  private async hasCycle(startParentId: string): Promise<boolean> {
    const visited = new Set<string>();
    let currentParent: string | null = startParentId;
    while (currentParent) {
      if (visited.has(currentParent)) {
        return true;
      }
      visited.add(currentParent);
      const parent = await this.categoryRepository.findById(currentParent);
      currentParent = parent?.parentId ?? null;
    }
    return false;
  }

  private isAuthorized(
    memberships: Array<{ role: string; branchId: string | null }>
  ): boolean {
    return memberships.some((m) =>
      [
        CompanyRole.COMPANY_OWNER,
        CompanyRole.COMPANY_ADMIN,
        CompanyRole.BRANCH_OWNER,
        CompanyRole.BRANCH_ADMIN,
        CompanyRole.STOCK_ADMIN,
      ].includes(m.role as CompanyRole)
    );
  }
}

const schema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional().nullable(),
  user: z.object({
    companyId: z.string().min(1),
    memberships: z.array(
      z.object({
        role: z.string().min(1),
        branchId: z.string().nullable(),
      })
    ),
  }),
});
