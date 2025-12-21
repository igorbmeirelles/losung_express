import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  SignupInput,
  SignupUseCase,
} from "../../application/use-cases/signup.use-case.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1).max(20),
});

@injectable()
export class SignupController {
  constructor(
    @inject(DEPENDENCY_TOKENS.signupUseCase)
    private readonly signupUseCase: SignupUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const parseResult = signupSchema.safeParse(request.body);

    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid signup payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await signupControllerHelpers.executeUseCase(
      this.signupUseCase,
      parseResult.data
    );

    switch (result.status) {
      case "created":
        return response.sendStatus(201);
      case "conflict":
        return response.status(409).json({
          message: "Email already registered",
        });
      default:
        return response.status(500).json({
          message: "Could not complete signup",
        });
    }
  }
}

const signupControllerHelpers = {
  async executeUseCase(signupUseCase: SignupUseCase, data: SignupInput) {
    const result = await signupUseCase.execute(data);

    if (result.success) {
      return { status: "created" } as const;
    }

    if (result.error === "EMAIL_ALREADY_EXISTS") {
      return { status: "conflict" } as const;
    }

    return { status: "error" } as const;
  },
};
