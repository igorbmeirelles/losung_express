import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { WarehouseQuery } from "../ports/warehouse-query.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "../../tokens.js";
import { CompanyRole } from "../../../companies/domain/company-role.enum.js";

export interface ListWarehousesInput {
  user: {
    companyId: string;
    memberships: Array<{ role: string; branchId: string | null }>;
  };
}

export interface ListWarehousesOutput {
  warehouses: Array<{
    id: string;
    name: string;
    companyId: string;
  }>;
}

export type ListWarehousesError = "INVALID_INPUT" | "UNAUTHORIZED" | "UNEXPECTED";

@injectable()
export class ListWarehousesUseCase {
  constructor(
    @inject(WAREHOUSE_DEPENDENCY_TOKENS.warehouseQuery)
    private readonly warehouseQuery: WarehouseQuery
  ) {}

  async execute(
    input: ListWarehousesInput
  ): Promise<Result<ListWarehousesOutput, ListWarehousesError>> {
    const validation = schema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    try {
      const { companyId, memberships } = validation.data.user;
      const roles = memberships.map((m) => m.role);

      if (
        roles.includes(CompanyRole.COMPANY_OWNER) ||
        roles.includes(CompanyRole.COMPANY_ADMIN)
      ) {
        const warehouses = await this.warehouseQuery.findByCompany(companyId);
        return ok({ warehouses });
      }

      const branchScopedMemberships = memberships.filter((m) =>
        [
          CompanyRole.BRANCH_OWNER,
          CompanyRole.BRANCH_ADMIN,
          CompanyRole.STOCK_ADMIN,
          CompanyRole.STOCK_DISPATCHER,
        ].includes(m.role as CompanyRole)
      );

      if (branchScopedMemberships.length === 0) {
        return fail("UNAUTHORIZED");
      }

      const branchIds = branchScopedMemberships
        .map((m) => m.branchId)
        .filter((id): id is string => !!id);

      if (branchIds.length === 0) {
        return ok({ warehouses: [] });
      }

      const warehouses = await this.warehouseQuery.findByBranchIds(branchIds);
      return ok({ warehouses });
    } catch (error) {
      return fail("UNEXPECTED");
    }
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
