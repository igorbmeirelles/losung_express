import { describe, expect, it, jest } from "@jest/globals";
import { RefreshLoginUseCase } from "../../users/application/use-cases/refresh-login.use-case.js";
import type { AuthService } from "../../users/application/contracts/auth-service.js";
import type { SessionCache, SessionCacheEntry } from "../../users/application/contracts/session-cache.js";
import type { AuthUser, UserRepository } from "../../users/application/ports/user-repository.js";

class StubAuthService implements AuthService {
  signAccessMock: jest.MockedFunction<(payload: Record<string, unknown>) => Promise<string>> = jest.fn();
  signRefreshMock: jest.MockedFunction<(payload: Record<string, unknown>) => Promise<string>> = jest.fn();
  verifyRefreshMock: jest.MockedFunction<(token: string) => Promise<Record<string, unknown>>> = jest.fn();
  verifyAccess(): Promise<Record<string, unknown>> {
    throw new Error("not implemented");
  }
  signAccess(payload: Record<string, unknown>): Promise<string> {
    return this.signAccessMock(payload);
  }
  signRefresh(payload: Record<string, unknown>): Promise<string> {
    return this.signRefreshMock(payload);
  }
  verifyRefresh(token: string): Promise<Record<string, unknown>> {
    return this.verifyRefreshMock(token);
  }
}

class StubSessionCache implements SessionCache {
  saveSessionMock: jest.MockedFunction<(entry: SessionCacheEntry) => Promise<void>> = jest.fn();
  deleteSessionMock: jest.MockedFunction<(sid: string) => Promise<void>> = jest.fn();
  getSessionMock: jest.MockedFunction<(sid: string) => Promise<SessionCacheEntry | null>> = jest.fn();
  saveSession(entry: SessionCacheEntry): Promise<void> {
    return this.saveSessionMock(entry);
  }
  deleteSession(sessionId: string): Promise<void> {
    return this.deleteSessionMock(sessionId);
  }
  getSession(sessionId: string): Promise<SessionCacheEntry | null> {
    return this.getSessionMock(sessionId);
  }
}

class StubUserRepository implements UserRepository {
  constructor(private user: AuthUser | null) {}
  create(): Promise<any> {
    throw new Error("not implemented");
  }
  findByEmailWithAuth(): Promise<AuthUser | null> {
    return Promise.resolve(this.user);
  }
  findBoardMemberships(): Promise<any> {
    throw new Error("not implemented");
  }
}

const baseUser: AuthUser = {
  id: "u1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "hash",
  isActive: true,
  companyId: "c1",
  memberships: [{ role: "SELLER", branchId: "b1" }],
};

describe("RefreshLoginUseCase (unit)", () => {
  it("issues new tokens and rotates cache on valid refresh", async () => {
    const auth = new StubAuthService();
    const cache = new StubSessionCache();
    const repo = new StubUserRepository(baseUser);
    auth.verifyRefreshMock.mockResolvedValue({
      sid: "old-sid",
      email: baseUser.email,
      userId: baseUser.id,
    });
    cache.getSessionMock.mockResolvedValue({
      sessionId: "old-sid",
      userId: baseUser.id,
      accessToken: "old-access",
      refreshToken: "old-refresh",
    });
    auth.signAccessMock.mockResolvedValue("new-access");
    auth.signRefreshMock.mockResolvedValue("new-refresh");
    cache.saveSessionMock.mockResolvedValue();
    cache.deleteSessionMock.mockResolvedValue();

    const useCase = new RefreshLoginUseCase(auth, repo, cache);

    const result = await useCase.execute({ refreshToken: "old-refresh" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual({
        accessToken: "new-access",
        refreshToken: "new-refresh",
      });
    }
    expect(cache.saveSessionMock).toHaveBeenCalled();
    expect(cache.deleteSessionMock).toHaveBeenCalledWith("old-sid");
  });

  it("fails when session cache entry is missing", async () => {
    const auth = new StubAuthService();
    const cache = new StubSessionCache();
    const repo = new StubUserRepository(baseUser);
    auth.verifyRefreshMock.mockResolvedValue({
      sid: "missing",
      email: baseUser.email,
      userId: baseUser.id,
    });
    cache.getSessionMock.mockResolvedValue(null);

    const useCase = new RefreshLoginUseCase(auth, repo, cache);

    const result = await useCase.execute({ refreshToken: "token" });

    expect(result).toEqual({ success: false, error: "INVALID_TOKEN" });
  });

  it("fails when refresh token does not match cache entry", async () => {
    const auth = new StubAuthService();
    const cache = new StubSessionCache();
    const repo = new StubUserRepository(baseUser);
    auth.verifyRefreshMock.mockResolvedValue({
      sid: "sid1",
      email: baseUser.email,
      userId: baseUser.id,
    });
    cache.getSessionMock.mockResolvedValue({
      sessionId: "sid1",
      userId: baseUser.id,
      accessToken: "old-access",
      refreshToken: "other-token",
    });

    const useCase = new RefreshLoginUseCase(auth, repo, cache);

    const result = await useCase.execute({ refreshToken: "token" });

    expect(result).toEqual({ success: false, error: "INVALID_TOKEN" });
  });

  it("fails when refresh token is invalid", async () => {
    const auth = new StubAuthService();
    const cache = new StubSessionCache();
    const repo = new StubUserRepository(baseUser);
    auth.verifyRefreshMock.mockRejectedValue(new Error("bad"));

    const useCase = new RefreshLoginUseCase(auth, repo, cache);

    const result = await useCase.execute({ refreshToken: "bad" });

    expect(result).toEqual({ success: false, error: "INVALID_TOKEN" });
  });
});
