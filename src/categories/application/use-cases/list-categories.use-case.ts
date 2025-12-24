import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { CategoryQuery } from "../ports/category-query.js";
import { CATEGORY_DEPENDENCY_TOKENS } from "../../tokens.js";
import { CompanyRole } from "../../../companies/domain/company-role.enum.js";

export interface ListCategoriesInput {
  user: {
    companyId: string;
    memberships: Array<{ role: string; branchId: string | null }>;
  };
}

export interface ListCategoriesOutput {
  categories: Array<{
    id: string;
    name: string;
    parentId: string | null;
    companyId: string;
  }>;
}

export type ListCategoriesError = "INVALID_INPUT" | "UNAUTHORIZED" | "UNEXPECTED";

@injectable()
export class ListCategoriesUseCase {
  constructor(
    @inject(CATEGORY_DEPENDENCY_TOKENS.categoryQuery)
    private readonly categoryQuery: CategoryQuery
  ) {}

  async execute(
    input: ListCategoriesInput
  ): Promise<Result<ListCategoriesOutput, ListCategoriesError>> {
    const validation = schema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    const { companyId, memberships } = validation.data.user;

    if (!this.isAuthorized(memberships)) {
      return fail("UNAUTHORIZED");
    }

    try {
      const categories = await this.categoryQuery.findByCompany(companyId);
      return ok({ categories });
    } catch (error) {
      return fail("UNEXPECTED");
    }
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
        CompanyRole.STOCK_DISPATCHER,
        CompanyRole.SELLER,
      ].includes(m.role as CompanyRole)
    );
  }
}

const schema = z.object({
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
