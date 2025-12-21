import { describe, expect, it, jest } from "@jest/globals";
import { HasCompanyUseCase } from "../../users/application/use-cases/has-company.use-case.js";
import type { AuthService } from "../../users/application/contracts/auth-service.js";
import type {
  BoardMembership,
  UserRepository,
} from "../../users/application/ports/user-repository.js";

class StubAuthService implements AuthService {
  signAccess(): Promise<string> {
    throw new Error("not implemented");
  }
  signRefresh(): Promise<string> {
    throw new Error("not implemented");
  }
  verifyRefresh(): Promise<Record<string, unknown>> {
    throw new Error("not implemented");
  }
  verifyAccessMock: jest.MockedFunction<(token: string) => Promise<Record<string, unknown>>> = jest.fn();
  verifyAccess(token: string): Promise<Record<string, unknown>> {
    return this.verifyAccessMock(token);
  }
}

class StubUserRepository implements UserRepository {
  constructor(private memberships: BoardMembership[]) {}

  create(): Promise<any> {
    throw new Error("not implemented");
  }
  findByEmailWithAuth(): Promise<any> {
    throw new Error("not implemented");
  }
  async findBoardMemberships(): Promise<BoardMembership[]> {
    return this.memberships;
  }
}

describe("HasCompanyUseCase (unit)", () => {
  it("returns false when user has no board memberships", async () => {
    const auth = new StubAuthService();
    auth.verifyAccessMock.mockResolvedValue({ userId: "u1" });
    const repo = new StubUserRepository([]);

    const useCase = new HasCompanyUseCase(auth, repo);

    const result = await useCase.execute({ accessToken: "token" });

    expect(result).toEqual({ success: true, value: { hasCompany: false } });
  });

  it("returns true when user is listed in board members", async () => {
    const auth = new StubAuthService();
    auth.verifyAccessMock.mockResolvedValue({ userId: "u1" });
    const repo = new StubUserRepository([
      { isActive: true, role: "SELLER", branchId: "b1", companyId: "c1" },
    ]);

    const useCase = new HasCompanyUseCase(auth, repo);

    const result = await useCase.execute({ accessToken: "token" });

    expect(result).toEqual({ success: true, value: { hasCompany: true } });
  });

  it("returns invalid token when access token verification fails", async () => {
    const auth = new StubAuthService();
    auth.verifyAccessMock.mockRejectedValue(new Error("bad"));
    const repo = new StubUserRepository([]);

    const useCase = new HasCompanyUseCase(auth, repo);

    const result = await useCase.execute({ accessToken: "bad" });

    expect(result).toEqual({ success: false, error: "INVALID_TOKEN" });
  });

  it("returns false when memberships are inactive", async () => {
    const auth = new StubAuthService();
    auth.verifyAccessMock.mockResolvedValue({ userId: "u1" });
    const repo = new StubUserRepository([
      { isActive: false, role: "SELLER", branchId: "b1", companyId: "c1" },
    ]);

    const useCase = new HasCompanyUseCase(auth, repo);

    const result = await useCase.execute({ accessToken: "token" });

    expect(result).toEqual({ success: true, value: { hasCompany: false } });
  });
});
