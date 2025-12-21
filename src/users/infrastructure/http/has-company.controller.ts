import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  HasCompanyInput,
  HasCompanyUseCase,
} from "../../application/use-cases/has-company.use-case.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

const tokenSchema = z.object({
  accessToken: z.string().min(1),
});

@injectable()
export class HasCompanyController {
  constructor(
    @inject(DEPENDENCY_TOKENS.hasCompanyUseCase)
    private readonly hasCompanyUseCase: HasCompanyUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const bearer = request.headers.authorization ?? "";
    const token = bearer.startsWith("Bearer ") ? bearer.replace("Bearer ", "") : "";
    const parseResult = tokenSchema.safeParse({ accessToken: token });

    if (!parseResult.success) {
      return response.status(401).json({
        message: "Invalid token",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.hasCompanyUseCase.execute(
      parseResult.data as HasCompanyInput
    );

    if (result.success) {
      return response.status(200).json({ hasCompany: result.value.hasCompany });
    }

    if (result.error === "INVALID_TOKEN") {
      return response.status(401).json({ message: "Invalid token" });
    }

    return response
      .status(500)
      .json({ message: "Could not determine company ownership" });
  }
}
