import type { NextFunction, Request, Response } from "express";
import { container } from "../../../../container.js";
import { DEPENDENCY_TOKENS } from "../../../tokens.js";
import type { AuthService } from "../../../application/contracts/auth-service.js";

export function accessTokenMiddleware() {
  const authService = container.resolve<AuthService>(DEPENDENCY_TOKENS.authService);

  return async function (request: Request, response: Response, next: NextFunction) {
    const bearer = request.headers.authorization ?? "";
    const accessToken = bearer.startsWith("Bearer ")
      ? bearer.replace("Bearer ", "")
      : "";

    if (!accessToken) {
      return response.status(401).json({ message: "Missing access token" });
    }

    try {
      const payload = await authService.verifyAccess(accessToken);
      request.user = {
        userId: payload["userId"] as string,
        firstName: payload["firstName"] as string,
        lastName: payload["lastName"] as string,
        email: payload["email"] as string,
        companyId: (payload["companyId"] as string) ?? null,
        roles: (payload["roles"] as string[]) ?? [],
        branchIds: (payload["branchIds"] as string[]) ?? [],
        memberships:
          (payload["memberships"] as Array<{ role: string; branchId: string | null }>) ?? [],
      };
      return next();
    } catch (error) {
      return response.status(401).json({ message: "Invalid access token" });
    }
  };
}
