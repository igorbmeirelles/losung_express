import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import { CompanyRole } from "../../../companies/domain/company-role.enum.js";
import type { BranchWarehouseRepository } from "../ports/branch-warehouse-repository.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "../../tokens.js";

export interface AssociateWarehouseBranchInput {
  warehouseId: string;
  branchId: string;
  user: {
    memberships: Array<{ role: string; branchId: string | null }>;
    companyId: string;
  };
}

export interface AssociateWarehouseBranchOutput {
  warehouseId: string;
  branchId: string;
}

export type AssociateWarehouseBranchError =
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "DUPLICATE"
  | "UNEXPECTED";

@injectable()
export class AssociateWarehouseBranchUseCase {
  constructor(
    @inject(WAREHOUSE_DEPENDENCY_TOKENS.branchWarehouseRepository)
    private readonly branchWarehouseRepository: BranchWarehouseRepository
  ) {}

  async execute(
    input: AssociateWarehouseBranchInput
  ): Promise<Result<AssociateWarehouseBranchOutput, AssociateWarehouseBranchError>> {
    const validation = schema.safeParse(input);
    if (!validation.success) return fail("INVALID_INPUT");

    const { warehouseId, branchId, user } = validation.data;

    if (!this.isAuthorized(user.memberships, branchId)) {
      return fail("UNAUTHORIZED");
    }

    try {
      const alreadyExists = await this.branchWarehouseRepository.exists(
        warehouseId,
        branchId
      );
      if (alreadyExists) {
        return fail("DUPLICATE");
      }

      await this.branchWarehouseRepository.create({
        warehouseId,
        branchId,
        isActive: true,
      });

      return ok({ warehouseId, branchId });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }

  private isAuthorized(
    memberships: Array<{ role: string; branchId: string | null }>,
    targetBranch: string
  ): boolean {
    return memberships.some((membership) => {
      if (
        membership.role === CompanyRole.COMPANY_OWNER ||
        membership.role === CompanyRole.COMPANY_ADMIN
      ) {
        return true;
      }

      if (
        (membership.role === CompanyRole.BRANCH_OWNER ||
          membership.role === CompanyRole.BRANCH_ADMIN) &&
        membership.branchId === targetBranch
      ) {
        return true;
      }

      return false;
    });
  }
}

const schema = z.object({
  warehouseId: z.string().min(1),
  branchId: z.string().min(1),
  user: z.object({
    memberships: z.array(
      z.object({
        role: z.string().min(1),
        branchId: z.string().nullable(),
      })
    ),
    companyId: z.string().min(1),
  }),
});
