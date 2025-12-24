import { describe, expect, it, jest } from "@jest/globals";
import { ListWarehousesUseCase } from "../../warehouses/application/use-cases/list-warehouses.use-case.js";
import type { WarehouseQuery } from "../../warehouses/application/ports/warehouse-query.js";
import { CompanyRole } from "../../companies/domain/company-role.enum.js";

class StubWarehouseQuery implements WarehouseQuery {
  findByCompanyMock: jest.MockedFunction<(companyId: string) => Promise<any[]>> =
    jest.fn();
  findByBranchIdsMock: jest.MockedFunction<(branchIds: string[]) => Promise<any[]>> =
    jest.fn();

  findByCompany(companyId: string): Promise<any[]> {
    return this.findByCompanyMock(companyId);
  }
  findByBranchIds(branchIds: string[]): Promise<any[]> {
    return this.findByBranchIdsMock(branchIds);
  }
}

describe("ListWarehousesUseCase (unit)", () => {
  it("returns company warehouses for COMPANY_OWNER", async () => {
    const query = new StubWarehouseQuery();
    query.findByCompanyMock.mockResolvedValue([{ id: "w1", name: "Main", companyId: "c1" }]);
    const useCase = new ListWarehousesUseCase(query);

    const result = await useCase.execute({
      user: {
        companyId: "c1",
        memberships: [{ role: CompanyRole.COMPANY_OWNER, branchId: null }],
      },
    });

    expect(result).toEqual({
      success: true,
      value: { warehouses: [{ id: "w1", name: "Main", companyId: "c1" }] },
    });
  });

  it("returns branch-scoped warehouses for branch roles", async () => {
    const query = new StubWarehouseQuery();
    query.findByBranchIdsMock.mockResolvedValue([
      { id: "w2", name: "Branch warehouse", companyId: "c1" },
    ]);
    const useCase = new ListWarehousesUseCase(query);

    const result = await useCase.execute({
      user: {
        companyId: "c1",
        memberships: [{ role: CompanyRole.BRANCH_ADMIN, branchId: "b1" }],
      },
    });

    expect(result).toEqual({
      success: true,
      value: { warehouses: [{ id: "w2", name: "Branch warehouse", companyId: "c1" }] },
    });
  });

  it("rejects unauthorized roles", async () => {
    const query = new StubWarehouseQuery();
    const useCase = new ListWarehousesUseCase(query);

    const result = await useCase.execute({
      user: {
        companyId: "c1",
        memberships: [{ role: "SELLER", branchId: null }],
      },
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
  });
});
