import { describe, expect, it, jest } from "@jest/globals";
import { AssociateWarehouseBranchUseCase } from "../../warehouses/application/use-cases/associate-warehouse-branch.use-case.js";
import type { BranchWarehouseRepository } from "../../warehouses/application/ports/branch-warehouse-repository.js";
import { CompanyRole } from "../../companies/domain/company-role.enum.js";

class StubBranchWarehouseRepository implements BranchWarehouseRepository {
  existsMock: jest.MockedFunction<(warehouseId: string, branchId: string) => Promise<boolean>> = jest.fn();
  createMock: jest.MockedFunction<any> = jest.fn();
  async create(data: any) {
    this.createMock(data);
    return { id: "bw1", ...data };
  }
  async exists(warehouseId: string, branchId: string): Promise<boolean> {
    return this.existsMock(warehouseId, branchId);
  }
}

const baseInput = {
  warehouseId: "w1",
  branchId: "b1",
  user: {
    memberships: [{ role: CompanyRole.COMPANY_OWNER, branchId: "b1" }],
    companyId: "c1",
  },
};

describe("AssociateWarehouseBranchUseCase (unit)", () => {
  it("allows COMPANY_OWNER to associate any branch", async () => {
    const repo = new StubBranchWarehouseRepository();
    repo.existsMock.mockResolvedValue(false);
    const useCase = new AssociateWarehouseBranchUseCase(repo);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({
      success: true,
      value: { warehouseId: "w1", branchId: "b1" },
    });
    expect(repo.createMock).toHaveBeenCalledWith(
      expect.objectContaining({ warehouseId: "w1", branchId: "b1" })
    );
  });

  it("rejects duplicate association", async () => {
    const repo = new StubBranchWarehouseRepository();
    repo.existsMock.mockResolvedValue(true);
    const useCase = new AssociateWarehouseBranchUseCase(repo);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ success: false, error: "DUPLICATE" });
  });

  it("rejects BRANCH_ADMIN associating outside their branches", async () => {
    const repo = new StubBranchWarehouseRepository();
    repo.existsMock.mockResolvedValue(false);
    const useCase = new AssociateWarehouseBranchUseCase(repo);

    const result = await useCase.execute({
      ...baseInput,
      branchId: "b2",
      user: {
        memberships: [{ role: CompanyRole.BRANCH_ADMIN, branchId: "b1" }],
        companyId: "c1",
      },
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
    expect(repo.createMock).not.toHaveBeenCalled();
  });

  it("allows BRANCH_OWNER for own branch", async () => {
    const repo = new StubBranchWarehouseRepository();
    repo.existsMock.mockResolvedValue(false);
    const useCase = new AssociateWarehouseBranchUseCase(repo);

    const result = await useCase.execute({
      ...baseInput,
      user: {
        memberships: [{ role: CompanyRole.BRANCH_OWNER, branchId: "b1" }],
        companyId: "c1",
      },
    });

    expect(result.success).toBe(true);
  });
});
