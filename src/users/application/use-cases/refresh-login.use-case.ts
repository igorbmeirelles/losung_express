import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { ulid } from "ulid";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { AuthService } from "../contracts/auth-service.js";
import type { SessionCache } from "../contracts/session-cache.js";
import type { UserRepository } from "../ports/user-repository.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

export interface RefreshLoginInput {
  refreshToken: string;
}

export interface RefreshLoginOutput {
  accessToken: string;
  refreshToken: string;
}

export type RefreshLoginError = "INVALID_TOKEN" | "UNEXPECTED";

@injectable()
export class RefreshLoginUseCase {
  constructor(
    @inject(DEPENDENCY_TOKENS.authService)
    private readonly authService: AuthService,
    @inject(DEPENDENCY_TOKENS.userRepository)
    private readonly userRepository: UserRepository,
    @inject(DEPENDENCY_TOKENS.sessionCache)
    private readonly sessionCache: SessionCache
  ) {}

  async execute(
    input: RefreshLoginInput
  ): Promise<Result<RefreshLoginOutput, RefreshLoginError>> {
    const validation = refreshSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_TOKEN");
    }

    const providedToken = validation.data.refreshToken;

    try {
      const payload = await this.authService.verifyRefresh(providedToken);
      const sid = payload["sid"];
      const email = payload["email"];
      const userId = payload["userId"];

      if (
        typeof sid !== "string" ||
        !sid ||
        typeof email !== "string" ||
        !email ||
        typeof userId !== "string" ||
        !userId
      ) {
        return fail("INVALID_TOKEN");
      }

      const cached = await this.sessionCache.getSession(sid);
      if (!cached || cached.refreshToken !== providedToken) {
        return fail("INVALID_TOKEN");
      }

      const user = await this.userRepository.findByEmailWithAuth(email);
      if (!user || user.id !== userId || !user.isActive) {
        return fail("INVALID_TOKEN");
      }

      const context = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        companyId: user.companyId,
        memberships: user.memberships,
      };

      const newSid = ulid();
      const accessToken = await this.authService.signAccess(context);
      const refreshToken = await this.authService.signRefresh({
        userId: user.id,
        email: user.email,
        sid: newSid,
      });

      await this.sessionCache.saveSession({
        sessionId: newSid,
        userId: user.id,
        accessToken,
        refreshToken,
      });
      await this.sessionCache.deleteSession(sid);

      return ok({ accessToken, refreshToken });
    } catch (error) {
      return fail("INVALID_TOKEN");
    }
  }
}

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
