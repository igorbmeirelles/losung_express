import { describe, expect, it, jest } from "@jest/globals";
import { LogoutUseCase } from "../../users/application/use-cases/logout.use-case.js";
import type { AuthService } from "../../users/application/contracts/auth-service.js";
import type { SessionCache } from "../../users/application/contracts/session-cache.js";

class StubAuthService implements AuthService {
  signAccess(): Promise<string> {
    throw new Error("not implemented");
  }
  signRefresh(): Promise<string> {
    throw new Error("not implemented");
  }
  verifyRefreshMock: jest.MockedFunction<(token: string) => Promise<Record<string, unknown>>> = jest.fn();
  verifyRefresh(token: string): Promise<Record<string, unknown>> {
    return this.verifyRefreshMock(token);
  }
}

class StubSessionCache implements SessionCache {
  saveSession(): Promise<void> {
    throw new Error("not implemented");
  }
  deleteSessionMock: jest.MockedFunction<(sid: string) => Promise<void>> = jest.fn();
  deleteSession(sessionId: string): Promise<void> {
    return this.deleteSessionMock(sessionId);
  }
}

describe("LogoutUseCase (unit)", () => {
  it("invalidates the session cache using sid from refresh token", async () => {
    const auth = new StubAuthService();
    const cache = new StubSessionCache();
    auth.verifyRefreshMock.mockResolvedValue({ sid: "sid-123", userId: "u1" });
    cache.deleteSessionMock.mockResolvedValue();

    const useCase = new LogoutUseCase(auth, cache);

    const result = await useCase.execute({ refreshToken: "refresh.jwt" });

    expect(result.success).toBe(true);
    expect(cache.deleteSessionMock).toHaveBeenCalledWith("sid-123");
  });

  it("returns invalid token error when token verification fails", async () => {
    const auth = new StubAuthService();
    const cache = new StubSessionCache();
    auth.verifyRefreshMock.mockRejectedValue(new Error("bad token"));

    const useCase = new LogoutUseCase(auth, cache);

    const result = await useCase.execute({ refreshToken: "bad" });

    expect(result).toEqual({ success: false, error: "INVALID_TOKEN" });
    expect(cache.deleteSessionMock).not.toHaveBeenCalled();
  });
});
