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
    roles: string[];
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

    if (!this.isAuthorized(validation.data.user.roles)) {
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

  private isAuthorized(roles: string[]): boolean {
    return (
      roles.includes(CompanyRole.COMPANY_OWNER) ||
      roles.includes(CompanyRole.COMPANY_ADMIN)
    );
  }
}

const createWarehouseSchema = z.object({
  name: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    companyId: z.string().min(1),
    roles: z.array(z.string().min(1)),
  }),
});
