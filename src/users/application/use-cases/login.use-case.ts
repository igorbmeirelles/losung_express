import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { DEPENDENCY_TOKENS } from "../../tokens.js";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { PasswordHasher } from "../contracts/password-hasher.js";
import type { AuthService } from "../contracts/auth-service.js";
import type { UserRepository } from "../ports/user-repository.js";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
}

export type LoginError = "INVALID_CREDENTIALS" | "UNEXPECTED";

@injectable()
export class LoginUseCase {
  constructor(
    @inject(DEPENDENCY_TOKENS.userRepository)
    private readonly userRepository: UserRepository,
    @inject(DEPENDENCY_TOKENS.passwordHasher)
    private readonly passwordHasher: PasswordHasher,
    @inject(DEPENDENCY_TOKENS.authService)
    private readonly authService: AuthService
  ) {}

  async execute(input: LoginInput): Promise<Result<LoginOutput, LoginError>> {
    const validation = loginSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_CREDENTIALS");
    }

    try {
      const user = await this.userRepository.findByEmailWithAuth(
        validation.data.email
      );
      if (!user) return fail("INVALID_CREDENTIALS");
      if (!user.isActive) return fail("INVALID_CREDENTIALS");

      const isPasswordValid = await this.passwordHasher.verify(
        validation.data.password,
        user.password
      );
      if (!isPasswordValid) return fail("INVALID_CREDENTIALS");

      const context = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
        memberships: user.memberships,
      };

      const accessToken = await this.authService.signAccess(context);
      const refreshToken = await this.authService.signRefresh({
        userId: user.id,
        email: user.email,
      });

      return ok({ accessToken, refreshToken });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
