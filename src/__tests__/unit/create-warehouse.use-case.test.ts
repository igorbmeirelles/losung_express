import { describe, expect, it, jest } from "@jest/globals";
import { CreateWarehouseUseCase } from "../../warehouses/application/use-cases/create-warehouse.use-case.js";
import type { WarehouseRepository } from "../../warehouses/application/ports/warehouse-repository.js";
import { CompanyRole } from "../../companies/domain/company-role.enum.js";

class StubWarehouseRepository implements WarehouseRepository {
  createMock: jest.MockedFunction<any> = jest.fn();
  async create(data: any) {
    this.createMock(data);
    return { id: "w1", ...data };
  }
}

const baseInput = {
  name: "Main Warehouse",
  user: {
    id: "u1",
    companyId: "c1",
    memberships: [{ role: CompanyRole.COMPANY_OWNER, branchId: null }],
  },
};

describe("CreateWarehouseUseCase (unit)", () => {
  it("allows COMPANY_OWNER to create warehouse", async () => {
    const repo = new StubWarehouseRepository();
    const useCase = new CreateWarehouseUseCase(repo);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ success: true, value: { warehouseId: "w1" } });
    expect(repo.createMock).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: "c1", isActive: true })
    );
  });

  it("rejects unauthorized roles", async () => {
    const repo = new StubWarehouseRepository();
    const useCase = new CreateWarehouseUseCase(repo);

    const result = await useCase.execute({
      ...baseInput,
      user: {
        ...baseInput.user,
        memberships: [{ role: "SELLER", branchId: null }],
      },
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
  });
});
