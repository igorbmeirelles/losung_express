import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  LoginInput,
  LoginUseCase,
} from "../../application/use-cases/login.use-case.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

@injectable()
export class LoginController {
  constructor(
    @inject(DEPENDENCY_TOKENS.loginUseCase)
    private readonly loginUseCase: LoginUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const parseResult = loginSchema.safeParse(request.body);

    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid login payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.loginUseCase.execute(
      parseResult.data as LoginInput
    );

    if (result.success) {
      return response.status(200).json({
        accessToken: result.value.accessToken,
        refreshToken: result.value.refreshToken,
      });
    }

    if (result.error === "INVALID_CREDENTIALS") {
      return response.status(401).json({ message: "Invalid credentials" });
    }

    return response.status(500).json({ message: "Could not complete login" });
  }
}
