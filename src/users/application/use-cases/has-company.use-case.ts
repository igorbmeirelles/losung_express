import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { AuthService } from "../contracts/auth-service.js";
import type { BoardMembership, UserRepository } from "../ports/user-repository.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

export interface HasCompanyInput {
  accessToken: string;
}

export interface HasCompanyOutput {
  hasCompany: boolean;
}

export type HasCompanyError = "INVALID_TOKEN" | "UNEXPECTED";

@injectable()
export class HasCompanyUseCase {
  constructor(
    @inject(DEPENDENCY_TOKENS.authService)
    private readonly authService: AuthService,
    @inject(DEPENDENCY_TOKENS.userRepository)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    input: HasCompanyInput
  ): Promise<Result<HasCompanyOutput, HasCompanyError>> {
    const validation = hasCompanySchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_TOKEN");
    }

    try {
      const payload = await this.authService.verifyAccess(
        validation.data.accessToken
      );
      const userId = payload["userId"];
      if (typeof userId !== "string" || !userId) {
        return fail("INVALID_TOKEN");
      }

      const memberships = await this.userRepository.findBoardMemberships(userId);

      const hasCompany = this.resolveHasCompany(memberships);

      return ok({ hasCompany });
    } catch (error) {
      return fail("INVALID_TOKEN");
    }
  }

  private resolveHasCompany(memberships: BoardMembership[]): boolean {
    const activeMemberships = memberships.filter((m) => m.isActive);
    return activeMemberships.length > 0;
  }
}

const hasCompanySchema = z.object({
  accessToken: z.string().min(1),
});
