import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  CreateWarehouseInput,
  CreateWarehouseUseCase,
} from "../../application/use-cases/create-warehouse.use-case.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "../../tokens.js";

const warehouseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

@injectable()
export class CreateWarehouseController {
  constructor(
    @inject(WAREHOUSE_DEPENDENCY_TOKENS.createWarehouseUseCase)
    private readonly createWarehouseUseCase: CreateWarehouseUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;
    if (!user || !user.userId || !user.companyId) {
      return response.status(401).json({ message: "Invalid access token" });
    }

    const parseResult = warehouseSchema.safeParse(request.body);
    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid warehouse payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.createWarehouseUseCase.execute({
      name: parseResult.data.name,
      description: parseResult.data.description ?? null,
      user: {
        id: user.userId,
        companyId: user.companyId,
        roles: user.roles ?? [],
      },
    } as CreateWarehouseInput);

    if (result.success) {
      return response.status(201).json({ warehouseId: result.value.warehouseId });
    }

    if (result.error === "UNAUTHORIZED") {
      return response.status(403).json({ message: "Not allowed to create warehouse" });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid warehouse data" });
    }

    return response
      .status(500)
      .json({ message: "Could not create warehouse at this time" });
  }
}
