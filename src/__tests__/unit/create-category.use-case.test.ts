import { describe, expect, it, jest } from "@jest/globals";
import { CreateCategoryUseCase } from "../../categories/application/use-cases/create-category.use-case.js";
import type { CategoryRepository } from "../../categories/application/ports/category-repository.js";
import { CompanyRole } from "../../companies/domain/company-role.enum.js";

class StubCategoryRepository implements CategoryRepository {
  parent: any = null;
  created: any = null;
  findByIdMock: jest.MockedFunction<(id: string) => Promise<any>> = jest.fn();
  async create(data: any) {
    this.created = { id: "cat-1", ...data };
    return this.created;
  }
  async findById(id: string) {
    if (this.findByIdMock.getMockImplementation()) {
      return this.findByIdMock(id);
    }
    return this.parent && this.parent.id === id ? this.parent : null;
  }
}

const baseInput = {
  name: "Category",
  user: {
    companyId: "c1",
    memberships: [{ role: CompanyRole.COMPANY_OWNER, branchId: null }],
  },
};

describe("CreateCategoryUseCase (unit)", () => {
  it("creates root category for authorized user", async () => {
    const repo = new StubCategoryRepository();
    const useCase = new CreateCategoryUseCase(repo);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ success: true, value: { categoryId: "cat-1" } });
    expect(repo.created).toMatchObject({ name: "Category", parentId: null, companyId: "c1" });
  });

  it("creates child category when parent exists and same company", async () => {
    const repo = new StubCategoryRepository();
    repo.parent = { id: "parent-1", parentId: null, companyId: "c1", name: "Parent" };
    const useCase = new CreateCategoryUseCase(repo);

    const result = await useCase.execute({
      ...baseInput,
      parentId: "parent-1",
    });

    expect(result.success).toBe(true);
    expect(repo.created?.parentId).toBe("parent-1");
  });

  it("rejects invalid parent", async () => {
    const repo = new StubCategoryRepository();
    const useCase = new CreateCategoryUseCase(repo);

    const result = await useCase.execute({
      ...baseInput,
      parentId: "missing",
    });

    expect(result).toEqual({ success: false, error: "INVALID_PARENT" });
  });

  it("rejects unauthorized role", async () => {
    const repo = new StubCategoryRepository();
    const useCase = new CreateCategoryUseCase(repo);

    const result = await useCase.execute({
      name: "x",
      user: {
        companyId: "c1",
        memberships: [{ role: "SELLER", branchId: null }],
      },
    });

    expect(result).toEqual({ success: false, error: "UNAUTHORIZED" });
  });

  it("rejects cyclic tree", async () => {
    const repo = new StubCategoryRepository();
    repo.findByIdMock.mockImplementation(async (id: string) => {
      if (id === "p1") return { id: "p1", parentId: "p2", companyId: "c1", name: "P1" };
      if (id === "p2") return { id: "p2", parentId: "p1", companyId: "c1", name: "P2" };
      return null;
    });
    const useCase = new CreateCategoryUseCase(repo);

    const result = await useCase.execute({
      ...baseInput,
      parentId: "p1",
    });

    expect(result).toEqual({ success: false, error: "CYCLIC_TREE" });
  });
});
