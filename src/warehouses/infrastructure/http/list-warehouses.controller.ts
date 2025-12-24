import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type {
  ListWarehousesInput,
  ListWarehousesUseCase,
} from "../../application/use-cases/list-warehouses.use-case.js";
import { WAREHOUSE_DEPENDENCY_TOKENS } from "../../tokens.js";

@injectable()
export class ListWarehousesController {
  constructor(
    @inject(WAREHOUSE_DEPENDENCY_TOKENS.listWarehousesUseCase)
    private readonly useCase: ListWarehousesUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;
    if (!user || !user.companyId) {
      return response.status(401).json({ message: "Invalid access token" });
    }

    const result = await this.useCase.execute({
      user: {
        companyId: user.companyId,
        memberships: user.memberships ?? [],
      },
    } as ListWarehousesInput);

    if (result.success) {
      return response.status(200).json({ warehouses: result.value.warehouses });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid warehouse context" });
    }

    if (result.error === "UNAUTHORIZED") {
      return response.status(403).json({ message: "Not allowed to list warehouses" });
    }

    return response
      .status(500)
      .json({ message: "Could not list warehouses at this time" });
  }
}
