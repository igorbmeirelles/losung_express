import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type {
  ListCategoriesInput,
  ListCategoriesUseCase,
} from "../../application/use-cases/list-categories.use-case.js";
import { CATEGORY_DEPENDENCY_TOKENS } from "../../tokens.js";

@injectable()
export class ListCategoriesController {
  constructor(
    @inject(CATEGORY_DEPENDENCY_TOKENS.listCategoriesUseCase)
    private readonly listCategoriesUseCase: ListCategoriesUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;
    if (!user || !user.companyId) {
      return response.status(401).json({ message: "Invalid access token" });
    }

    const result = await this.listCategoriesUseCase.execute({
      user: {
        companyId: user.companyId,
        memberships: user.memberships ?? [],
      },
    } as ListCategoriesInput);

    if (result.success) {
      return response.status(200).json({ categories: result.value.categories });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid category context" });
    }

    if (result.error === "UNAUTHORIZED") {
      return response.status(403).json({ message: "Not allowed to list categories" });
    }

    return response.status(500).json({ message: "Could not list categories" });
  }
}
