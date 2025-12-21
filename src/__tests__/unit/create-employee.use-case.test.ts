import { describe, expect, it, jest } from "@jest/globals";
import { CreateEmployeeUseCase } from "../../companies/application/use-cases/create-employee.use-case.js";
import type { PasswordHasher } from "../../users/application/contracts/password-hasher.js";
import type { UserRepository } from "../../users/application/ports/user-repository.js";
import type { BoardMembersRepository } from "../../companies/application/ports/board-members-repository.js";
import { CompanyRole } from "../../companies/domain/company-role.enum.js";

class StubUserRepository implements UserRepository {
  constructor(private readonly id: string) {}
  create(data: any) {
    return Promise.resolve({ id: this.id, ...data });
  }
  findByEmailWithAuth(): Promise<any> {
    throw new Error("not implemented");
  }
  findBoardMemberships(): Promise<any> {
    throw new Error("not implemented");
  }
}

class StubPasswordHasher implements PasswordHasher {
  hashMock: jest.MockedFunction<(password: string) => Promise<string>> = jest.fn();
  verify(): Promise<boolean> {
    throw new Error("not implemented");
  }
  hash(password: string): Promise<string> {
    return this.hashMock(password);
  }
}

class StubBoardMembersRepository implements BoardMembersRepository {
  created: any[] = [];
  create(data: any) {
    this.created.push(data);
    return Promise.resolve({ id: "bm1", ...data, roles: data.roles });
  }
}

const baseInput = {
  creator: { id: "admin", roles: [CompanyRole.COMPANY_OWNER], branchIds: ["b1"] },
  employee: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "secret",
  },
  branchId: "b1",
  roles: [CompanyRole.SELLER],
  companyId: "c1",
};

describe("CreateEmployeeUseCase (unit)", () => {
  it("allows COMPANY_OWNER to create employee in any branch", async () => {
    const userRepo = new StubUserRepository("u2");
    const hasher = new StubPasswordHasher();
    hasher.hashMock.mockResolvedValueOnce("hashed");
    const boardRepo = new StubBoardMembersRepository();

    const useCase = new CreateEmployeeUseCase(userRepo, hasher, boardRepo);

    const result = await useCase.execute(baseInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.userId).toBe("u2");
    }
    expect(boardRepo.created).toHaveLength(1);
  });

  it("rejects unauthorized roles", async () => {
    const userRepo = new StubUserRepository("u2");
    const hasher = new StubPasswordHasher();
    const boardRepo = new StubBoardMembersRepository();

    const useCase = new CreateEmployeeUseCase(userRepo, hasher, boardRepo);

    const result = await useCase.execute({
      ...baseInput,
      creator: { id: "x", roles: ["SELLER"], branchIds: ["b1"] },
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
  });

  it("restricts BRANCH_ADMIN to own branches", async () => {
    const userRepo = new StubUserRepository("u2");
    const hasher = new StubPasswordHasher();
    hasher.hashMock.mockResolvedValueOnce("hashed");
    const boardRepo = new StubBoardMembersRepository();

    const useCase = new CreateEmployeeUseCase(userRepo, hasher, boardRepo);

    const result = await useCase.execute({
      ...baseInput,
      creator: { id: "ba", roles: [CompanyRole.BRANCH_ADMIN], branchIds: ["b1"] },
      branchId: "b2",
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
  });

  it("allows COMPANY_ADMIN to create employees in any branch", async () => {
    const userRepo = new StubUserRepository("u3");
    const hasher = new StubPasswordHasher();
    hasher.hashMock.mockResolvedValueOnce("hashed");
    const boardRepo = new StubBoardMembersRepository();

    const useCase = new CreateEmployeeUseCase(userRepo, hasher, boardRepo);

    const result = await useCase.execute({
      ...baseInput,
      creator: { id: "admin", roles: [CompanyRole.COMPANY_ADMIN], branchIds: [] },
      branchId: "b2",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.branchId).toEqual("b2");
    }
  });
});
