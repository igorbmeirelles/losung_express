import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  CreateCategoryInput,
  CreateCategoryUseCase,
} from "../../application/use-cases/create-category.use-case.js";
import { CATEGORY_DEPENDENCY_TOKENS } from "../../tokens.js";

const categorySchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

@injectable()
export class CreateCategoryController {
  constructor(
    @inject(CATEGORY_DEPENDENCY_TOKENS.createCategoryUseCase)
    private readonly createCategoryUseCase: CreateCategoryUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;
    if (!user || !user.companyId) {
      return response.status(401).json({ message: "Invalid access token" });
    }

    const parseResult = categorySchema.safeParse(request.body);
    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid category payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.createCategoryUseCase.execute({
      ...(parseResult.data as Omit<CreateCategoryInput, "user">),
      user: {
        companyId: user.companyId,
        memberships: user.memberships ?? [],
      },
    });

    if (result.success) {
      return response.status(201).json({ categoryId: result.value.categoryId });
    }

    if (result.error === "UNAUTHORIZED") {
      return response.status(403).json({ message: "Not allowed to create category" });
    }

    if (result.error === "INVALID_PARENT") {
      return response.status(400).json({ message: "Invalid parent category" });
    }

    if (result.error === "CROSS_COMPANY") {
      return response.status(403).json({ message: "Parent must belong to same company" });
    }

    if (result.error === "CYCLIC_TREE") {
      return response.status(400).json({ message: "Cycle detected in category tree" });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid category data" });
    }

    return response
      .status(500)
      .json({ message: "Could not create category at this time" });
  }
}
