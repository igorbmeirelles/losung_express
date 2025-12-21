import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type {
  ListBranchesInput,
  ListBranchesUseCase,
} from "../../application/use-cases/list-branches.use-case.js";
import { COMPANY_DEPENDENCY_TOKENS } from "../../tokens.js";

@injectable()
export class ListBranchesController {
  constructor(
    @inject(COMPANY_DEPENDENCY_TOKENS.listBranchesUseCase)
    private readonly listBranchesUseCase: ListBranchesUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;

    if (!user || !user.branchIds || user.branchIds.length === 0) {
      return response.status(200).json({ branches: [] });
    }

    const result = await this.listBranchesUseCase.execute({
      branchIds: user.branchIds,
    } as ListBranchesInput);

    if (result.success) {
      return response.status(200).json({ branches: result.value.branches });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid branch context" });
    }

    return response
      .status(500)
      .json({ message: "Could not list branches at this time" });
  }
}
