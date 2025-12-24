import { describe, expect, it, jest } from "@jest/globals";
import { ListCategoriesUseCase } from "../../categories/application/use-cases/list-categories.use-case.js";
import type { CategoryQuery } from "../../categories/application/ports/category-query.js";
import { CompanyRole } from "../../companies/domain/company-role.enum.js";

class StubCategoryQuery implements CategoryQuery {
  findByCompanyMock: jest.MockedFunction<(companyId: string) => Promise<any[]>> = jest.fn();
  async findByCompany(companyId: string): Promise<any[]> {
    return this.findByCompanyMock(companyId);
  }
}

describe("ListCategoriesUseCase (unit)", () => {
  it("lists categories for authorized role", async () => {
    const query = new StubCategoryQuery();
    query.findByCompanyMock.mockResolvedValue([
      { id: "c1", name: "Cat", parentId: null, companyId: "c1" },
    ]);
    const useCase = new ListCategoriesUseCase(query);

    const result = await useCase.execute({
      user: {
        companyId: "c1",
        memberships: [{ role: CompanyRole.COMPANY_OWNER, branchId: null }],
      },
    });

    expect(result).toEqual({
      success: true,
      value: { categories: [{ id: "c1", name: "Cat", parentId: null, companyId: "c1" }] },
    });
    expect(query.findByCompanyMock).toHaveBeenCalledWith("c1");
  });

  it("rejects unauthorized roles", async () => {
    const query = new StubCategoryQuery();
    const useCase = new ListCategoriesUseCase(query);

    const result = await useCase.execute({
      user: {
        companyId: "c1",
        memberships: [{ role: "UNKNOWN", branchId: null }],
      },
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
  });
});
