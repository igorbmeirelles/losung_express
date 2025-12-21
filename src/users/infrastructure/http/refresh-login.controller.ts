import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  RefreshLoginInput,
  RefreshLoginUseCase,
} from "../../application/use-cases/refresh-login.use-case.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

@injectable()
export class RefreshLoginController {
  constructor(
    @inject(DEPENDENCY_TOKENS.refreshLoginUseCase)
    private readonly refreshLoginUseCase: RefreshLoginUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const parseResult = refreshSchema.safeParse(request.body);

    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid refresh payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.refreshLoginUseCase.execute(
      parseResult.data as RefreshLoginInput
    );

    if (result.success) {
      return response.status(200).json({
        accessToken: result.value.accessToken,
        refreshToken: result.value.refreshToken,
      });
    }

    if (result.error === "INVALID_TOKEN") {
      return response.status(401).json({ message: "Invalid refresh token" });
    }

    return response
      .status(500)
      .json({ message: "Could not refresh login session" });
  }
}
