import { describe, expect, it, jest } from "@jest/globals";
import { LoginUseCase } from "../../users/application/use-cases/login.use-case.js";
import type { AuthService } from "../../users/application/contracts/auth-service.js";
import type { PasswordHasher } from "../../users/application/contracts/password-hasher.js";
import type { AuthUser, UserRepository } from "../../users/application/ports/user-repository.js";
import type {
  SessionCache,
  SessionCacheEntry,
} from "../../users/application/contracts/session-cache.js";
import * as ulidModule from "ulid";

class StubUserRepository implements UserRepository {
  constructor(private authUser: AuthUser | null) {}

  create(): Promise<any> {
    throw new Error("not implemented");
  }

  async findByEmailWithAuth(): Promise<AuthUser | null> {
    return this.authUser;
  }
}

class StubPasswordHasher implements PasswordHasher {
  verifyMock: jest.MockedFunction<(password: string, hash: string) => Promise<boolean>> = jest.fn();
  hash(): Promise<string> {
    throw new Error("not implemented");
  }
  verify(password: string, hash: string): Promise<boolean> {
    return this.verifyMock(password, hash);
  }
}

class StubAuthService implements AuthService {
  signAccessMock: jest.MockedFunction<(payload: Record<string, unknown>) => Promise<string>> = jest.fn();
  signRefreshMock: jest.MockedFunction<(payload: Record<string, unknown>) => Promise<string>> = jest.fn();
  signAccess(payload: Record<string, unknown>): Promise<string> {
    return this.signAccessMock(payload);
  }
  signRefresh(payload: Record<string, unknown>): Promise<string> {
    return this.signRefreshMock(payload);
  }
}

class StubSessionCache implements SessionCache {
  saveSessionMock: jest.MockedFunction<(entry: SessionCacheEntry) => Promise<void>> = jest.fn();
  deleteSession(): Promise<void> {
    throw new Error("not implemented");
  }
  saveSession(entry: SessionCacheEntry): Promise<void> {
    return this.saveSessionMock(entry);
  }
}

const baseUser: AuthUser = {
  id: "u1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "hashed",
  isActive: true,
  companyId: "c1",
  memberships: [
    { role: "SELLER", branchId: "b1" },
    { role: "SELLER", branchId: "b2" },
  ],
};

describe("LoginUseCase (unit)", () => {
  beforeEach(() => {
    jest.spyOn(ulidModule, "ulid").mockReturnValue("01HSESSIONCACHEID");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("authenticates valid credentials and returns token/context", async () => {
    const repo = new StubUserRepository(baseUser);
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    hasher.verifyMock.mockResolvedValueOnce(true);
    auth.signAccessMock.mockResolvedValueOnce("access");
    auth.signRefreshMock.mockResolvedValueOnce("refresh");
    sessionCache.saveSessionMock.mockResolvedValueOnce();

    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    const result = await useCase.execute({
      email: baseUser.email,
      password: "secret",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.accessToken).toBe("access");
      expect(result.value.refreshToken).toBe("refresh");
    }
  });

  it("verifies password using hasher", async () => {
    const repo = new StubUserRepository(baseUser);
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    hasher.verifyMock.mockResolvedValueOnce(true);
    auth.signAccessMock.mockResolvedValueOnce("token");
    auth.signRefreshMock.mockResolvedValueOnce("refresh");
    sessionCache.saveSessionMock.mockResolvedValueOnce();
    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    await useCase.execute({ email: baseUser.email, password: "secret" });

    expect(hasher.verifyMock).toHaveBeenCalledWith("secret", baseUser.password);
  });

  it("rejects invalid credentials when password is wrong", async () => {
    const repo = new StubUserRepository(baseUser);
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    hasher.verifyMock.mockResolvedValueOnce(false);
    sessionCache.saveSessionMock.mockResolvedValueOnce();
    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    const result = await useCase.execute({
      email: baseUser.email,
      password: "wrong",
    });

    expect(result).toEqual({ success: false, error: "INVALID_CREDENTIALS" });
  });

  it("returns memberships (role + branch) from repository data", async () => {
    const repo = new StubUserRepository({
      ...baseUser,
      memberships: [
        { role: "ROOT", branchId: "bX" },
        { role: "SELLER", branchId: "bX" },
      ],
    });
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    hasher.verifyMock.mockResolvedValueOnce(true);
    auth.signAccessMock.mockImplementation(async (payload) => {
      expect(payload).toMatchObject({
        memberships: [
          { role: "ROOT", branchId: "bX" },
          { role: "SELLER", branchId: "bX" },
        ],
      });
      return "token";
    });
    auth.signRefreshMock.mockResolvedValueOnce("refresh");
    sessionCache.saveSessionMock.mockResolvedValueOnce();
    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    const result = await useCase.execute({
      email: baseUser.email,
      password: "secret",
    });

    expect(result.success).toBe(true);
  });

  it("fails when user not found", async () => {
    const repo = new StubUserRepository(null);
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    sessionCache.saveSessionMock.mockResolvedValueOnce();
    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    const result = await useCase.execute({
      email: "missing@example.com",
      password: "secret",
    });

    expect(result).toEqual({ success: false, error: "INVALID_CREDENTIALS" });
  });

  it("writes session cache entry with userId and tokens", async () => {
    const repo = new StubUserRepository(baseUser);
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    hasher.verifyMock.mockResolvedValueOnce(true);
    auth.signAccessMock.mockResolvedValueOnce("access");
    auth.signRefreshMock.mockResolvedValueOnce("refresh");
    sessionCache.saveSessionMock.mockResolvedValueOnce();

    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    await useCase.execute({
      email: baseUser.email,
      password: "secret",
    });

    expect(sessionCache.saveSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "01HSESSIONCACHEID",
        userId: baseUser.id,
        accessToken: "access",
        refreshToken: "refresh",
      })
    );
  });

  it("fails login if session cache write fails", async () => {
    const repo = new StubUserRepository(baseUser);
    const hasher = new StubPasswordHasher();
    const auth = new StubAuthService();
    const sessionCache = new StubSessionCache();
    hasher.verifyMock.mockResolvedValueOnce(true);
    auth.signAccessMock.mockResolvedValueOnce("access");
    auth.signRefreshMock.mockResolvedValueOnce("refresh");
    sessionCache.saveSessionMock.mockRejectedValueOnce(new Error("cache down"));

    const useCase = new LoginUseCase(repo, hasher, auth, sessionCache);

    const result = await useCase.execute({
      email: baseUser.email,
      password: "secret",
    });

    expect(result).toEqual({ success: false, error: "UNEXPECTED" });
  });
});
