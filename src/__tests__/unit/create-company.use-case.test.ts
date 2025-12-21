import { describe, expect, it } from "@jest/globals";
import { CreateCompanyUseCase } from "../../companies/application/use-cases/create-company.use-case.js";
import type { BranchRecord, BranchRepository } from "../../companies/application/ports/branch-repository.js";
import type { CompanyRecord, CompanyRepository } from "../../companies/application/ports/company-repository.js";
import type { BoardMemberRecord, BoardMembersRepository } from "../../companies/application/ports/board-members-repository.js";

class StubCompanyRepository implements CompanyRepository {
  constructor(private company: CompanyRecord) {}
  lastCreate?: any;
  create(data: any): Promise<CompanyRecord> {
    this.lastCreate = data;
    return Promise.resolve({ ...this.company, name: data.name });
  }
}

class StubBranchRepository implements BranchRepository {
  constructor(private branch: BranchRecord) {}
  lastCreate?: any;
  create(data: any): Promise<BranchRecord> {
    this.lastCreate = data;
    return Promise.resolve(this.branch);
  }
}

class StubBoardMembersRepository implements BoardMembersRepository {
  lastCreate?: any;
  create(data: any): Promise<BoardMemberRecord> {
    this.lastCreate = data;
    return Promise.resolve({
      id: "bm1",
      userId: data.userId,
      companyId: data.companyId,
      branchId: data.branchId,
      roles: data.roles,
    });
  }
}

describe("CreateCompanyUseCase (unit)", () => {
  it("creates company, branch, owner membership and returns tokens", async () => {
    const companyRepo = new StubCompanyRepository({
      id: "c1",
      name: "Acme",
      tenantUrl: null,
      isActive: true,
    });
    const branchRepo = new StubBranchRepository({
      id: "b1",
      name: "Branch",
      phone: "N/A",
      companyId: "c1",
    });
    const boardRepo = new StubBoardMembersRepository();

    const useCase = new CreateCompanyUseCase(
      companyRepo,
      branchRepo,
      boardRepo
    );

    const result = await useCase.execute({
      name: "Acme Inc",
      tenantUrl: "acme",
      branch: {
        name: "Main",
        phone: "123",
        address: {
          street: "Street",
          neighborhood: "Neighborhood",
          city: "City",
          country: "Country",
          zipCode: "000",
          number: "1",
        },
      },
      user: {
        id: "u1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.companyId).toBe("c1");
      expect(result.value.branchId).toBe("b1");
    }
    expect(companyRepo.lastCreate).toMatchObject({ name: "Acme Inc" });
    expect(branchRepo.lastCreate).toMatchObject({ companyId: "c1" });
    expect(boardRepo.lastCreate).toMatchObject({
      userId: "u1",
      companyId: "c1",
      branchId: "b1",
      roles: ["COMPANY_OWNER"],
    });
  });

  it("fails on invalid input", async () => {
    const companyRepo = new StubCompanyRepository({
      id: "c1",
      name: "Acme",
      tenantUrl: null,
      isActive: true,
    });
    const branchRepo = new StubBranchRepository({
      id: "b1",
      name: "Branch",
      phone: "N/A",
      companyId: "c1",
    });
    const boardRepo = new StubBoardMembersRepository();

    const useCase = new CreateCompanyUseCase(
      companyRepo,
      branchRepo,
      boardRepo
    );

    const result = await useCase.execute({
      name: "",
      branch: {
        name: "",
        phone: "",
        address: {
          street: "",
          neighborhood: "",
          city: "",
          country: "",
          zipCode: "",
          number: "",
        },
      },
      user: {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
      },
    });

    expect(result).toEqual({ success: false, error: "INVALID_INPUT" });
  });
});
