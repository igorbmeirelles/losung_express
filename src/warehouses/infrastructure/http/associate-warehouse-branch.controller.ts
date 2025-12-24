import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  AssociateWarehouseBranchInput,
  AssociateWarehouseBranchUseCase,
} from "../../application/use-cases/associate-warehouse-branch.use-case.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "../../tokens.js";

const payloadSchema = z.object({
  branchId: z.string().min(1),
});

@injectable()
export class AssociateWarehouseBranchController {
  constructor(
    @inject(WAREHOUSE_DEPENDENCY_TOKENS.associateWarehouseBranchUseCase)
    private readonly useCase: AssociateWarehouseBranchUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;
    if (!user || !user.userId || !user.companyId) {
      return response.status(401).json({ message: "Invalid access token" });
    }

    const parseResult = payloadSchema.safeParse(request.body);
    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid association payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const warehouseId = request.params.warehouseId;
    if (!warehouseId) {
      return response.status(400).json({ message: "Missing warehouseId" });
    }

    const result = await this.useCase.execute({
      warehouseId,
      branchId: parseResult.data.branchId,
      user: {
        memberships: user.memberships ?? [],
        companyId: user.companyId ?? "",
      },
    } as AssociateWarehouseBranchInput);

    if (result.success) {
      return response.status(200).json({
        warehouseId: result.value.warehouseId,
        branchId: result.value.branchId,
      });
    }

    if (result.error === "UNAUTHORIZED") {
      return response.status(403).json({ message: "Not allowed to associate branch" });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid association data" });
    }

    if (result.error === "DUPLICATE") {
      return response.status(409).json({ message: "Branch already associated" });
    }

    return response
      .status(500)
      .json({ message: "Could not associate branch at this time" });
  }
}
