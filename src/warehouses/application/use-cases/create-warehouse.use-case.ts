import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { WarehouseRepository } from "../ports/warehouse-repository.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "../../tokens.js";
import { CompanyRole } from "../../../companies/domain/company-role.enum.js";

export interface CreateWarehouseInput {
  name: string;
  user: {
    id: string;
    companyId: string;
    memberships: Array<{ role: string; branchId: string | null }>;
  };
}

export interface CreateWarehouseOutput {
  warehouseId: string;
}

export type CreateWarehouseError = "UNAUTHORIZED" | "INVALID_INPUT" | "UNEXPECTED";

@injectable()
export class CreateWarehouseUseCase {
  constructor(
    @inject(WAREHOUSE_DEPENDENCY_TOKENS.warehouseRepository)
    private readonly warehouseRepository: WarehouseRepository
  ) {}

  async execute(
    input: CreateWarehouseInput
  ): Promise<Result<CreateWarehouseOutput, CreateWarehouseError>> {
    const validation = createWarehouseSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    if (!this.isAuthorized(validation.data.user.memberships)) {
      return fail("UNAUTHORIZED");
    }

    try {
      const warehouse = await this.warehouseRepository.create({
        name: validation.data.name,
        companyId: validation.data.user.companyId,
        isActive: true,
      });

      return ok({ warehouseId: warehouse.id });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }

  private isAuthorized(
    memberships: Array<{ role: string; branchId: string | null }>
  ): boolean {
    return memberships.some(
      (m) =>
        m.role === CompanyRole.COMPANY_OWNER ||
        m.role === CompanyRole.COMPANY_ADMIN
    );
  }
}

const createWarehouseSchema = z.object({
  name: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    companyId: z.string().min(1),
    memberships: z.array(
      z.object({
        role: z.string().min(1),
        branchId: z.string().nullable(),
      })
    ),
  }),
});
