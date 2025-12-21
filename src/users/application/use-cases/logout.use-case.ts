import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { AuthService } from "../contracts/auth-service.js";
import type { SessionCache } from "../contracts/session-cache.js";
import { DEPENDENCY_TOKENS } from "../../tokens.js";

export interface LogoutInput {
  refreshToken: string;
}

export type LogoutError = "INVALID_TOKEN" | "UNEXPECTED";

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(DEPENDENCY_TOKENS.authService)
    private readonly authService: AuthService,
    @inject(DEPENDENCY_TOKENS.sessionCache)
    private readonly sessionCache: SessionCache
  ) {}

  async execute(input: LogoutInput): Promise<Result<void, LogoutError>> {
    const validation = logoutSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_TOKEN");
    }

    try {
      const payload = await this.authService.verifyRefresh(
        validation.data.refreshToken
      );
      const sid = payload["sid"];
      if (typeof sid !== "string" || !sid) {
        return fail("INVALID_TOKEN");
      }

      await this.sessionCache.deleteSession(sid);
      return ok(undefined);
    } catch (error) {
      return fail("INVALID_TOKEN");
    }
  }
}

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});
