import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  LogoutInput,
  LogoutUseCase,
} from "../../application/use-cases/logout.use-case.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

@injectable()
export class LogoutController {
  constructor(
    @inject(DEPENDENCY_TOKENS.logoutUseCase)
    private readonly logoutUseCase: LogoutUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const parseResult = logoutSchema.safeParse(request.body);

    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid logout payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.logoutUseCase.execute(
      parseResult.data as LogoutInput
    );

    if (result.success) {
      return response.status(204).send();
    }

    if (result.error === "INVALID_TOKEN") {
      return response.status(401).json({ message: "Invalid token" });
    }

    return response.status(500).json({ message: "Could not logout" });
  }
}
